using System;
using AElf.Contracts.MultiToken;
using AElf.CSharp.Core;
using AElf.Sdk.CSharp;
using AElf.Types;
using Google.Protobuf.WellKnownTypes;

namespace AElf.Contracts.LotteryContract
{
    public partial class LotteryContract : LotteryContractContainer.LotteryContractBase
    {
        public override Empty Initialize(InitializeInput input)
        {
            Assert(State.TokenSymbol.Value == null, "Already initialized");
            State.TokenContract.Value =
                Context.GetContractAddressByName(SmartContractConstants.TokenContractSystemName);
            State.AEDPoSContract.Value =
                Context.GetContractAddressByName(SmartContractConstants.ConsensusContractSystemName);
            State.GenesisContract.Value = Context.GetZeroSmartContractAddress();
            State.Admin.Value = State.GenesisContract.GetContractAuthor.Call(Context.Self);
            Assert(Context.Sender == State.Admin.Value,"No permission");
            
            State.Price.Value = input.Price;
            State.TokenSymbol.Value = input.TokenSymbol;
            State.BonusRate.Value = input.BonusRate;
            State.MaxRate.Value = input.MaxRate;
            State.MinRate.Value = input.MinRate;
            State.CashDuration.Value = input.CashDuration;
            State.CurrentPeriod.Value = 1;
            var date = Context.CurrentBlockTime.ToDateTime().ToString("yyyyMMdd");
            State.StartPeriodOfDay[date] = 1;
            State.CurrentLotteryId.Value = 1;
            State.Periods[1] = new PeriodBody
            {
                Period = 1,
                BlockNumber = Context.CurrentHeight,
                CreateTime = Context.CurrentBlockTime,
                RandomHash = Hash.Empty
            };
            return new Empty();
        }

        public override Empty Buy(BuyInput input)
        {
            return base.Buy(input);
        }

        public override Empty Draw(Int64Value input)
        {
            var currentPeriodNumber = State.CurrentPeriod.Value;
            Assert(input.Value.Add(1) == currentPeriodNumber, "Incorrect period.");
            Assert(currentPeriodNumber > 1, "Not ready to draw.");
            Assert(Context.Sender == State.Admin.Value, "No permission to draw!");

            var previousPeriodNumber = currentPeriodNumber.Sub(1);
            var previousPeriod = State.Periods[previousPeriodNumber];
            Assert(previousPeriod.RandomHash == Hash.Empty, "Latest period already drawn.");

            var currentPeriod = State.Periods[currentPeriodNumber];
            var expectedBlockNumber = currentPeriod.BlockNumber;
            Assert(Context.CurrentHeight >= expectedBlockNumber, "Block height not enough.");

            previousPeriod.RandomHash = State.AEDPoSContract.GetRandomHash.Call(new Int64Value
            {
                Value = expectedBlockNumber
            });
            previousPeriod.LuckyNumber = Math.Abs(previousPeriod.RandomHash.ToInt64() % 100000);
            previousPeriod.DrawTime = Context.CurrentBlockTime;
            previousPeriod.DrawBlockNumber = Context.CurrentHeight;
            State.Periods[previousPeriodNumber] = previousPeriod;
            
            return new Empty();
        }

        public override Empty PrepareDraw(Empty input)
        {
            Assert(Context.Sender == State.Admin.Value, "No permission to prepare!");

            // Check whether current period drew except period 1.
            if (State.CurrentPeriod.Value != 1)
            {
                Assert(State.Periods[State.CurrentPeriod.Value.Sub(1)].RandomHash != Hash.Empty,
                    $"Period {State.CurrentPeriod.Value.Sub(1)} hasn't drew.");
            }

            State.CurrentPeriod.Value = State.CurrentPeriod.Value.Add(1);

            // init next period
            var period = new PeriodBody
            {
                Period = State.CurrentPeriod.Value,
                BlockNumber = Context.CurrentHeight,
                RandomHash = Hash.Empty,
                CreateTime = Context.CurrentBlockTime
            };

            State.Periods[State.CurrentPeriod.Value] = period;

            return new Empty();
        }

        public override Empty TakeReward(TakeRewardInput input)
        {
            return base.TakeReward(input);
        }
        
        public override Empty SetMaxRate(Int32Value input)
        {
            Assert(input.Value > 0 && input.Value.Div(RateDecimals) < 1, "Invalid input");
            Assert(input.Value > State.MinRate.Value, "Min rate should be less than max rate");
            Assert(Context.Sender == State.Admin.Value, "No permission");
            State.MaxRate.Value = input.Value;
            return new Empty();
        }

        public override Empty SetMinRate(Int32Value input)
        {
            Assert(input.Value > 0 && input.Value.Div(RateDecimals) < 1, "Invalid input");
            Assert(input.Value < State.MaxRate.Value, "Min rate should be less than max rate");
            Assert(Context.Sender == State.Admin.Value, "No permission");
            State.MinRate.Value = input.Value;
            return new Empty();
        }

        public override Empty SetBonusRate(Int32Value input)
        {
            Assert(input.Value > 0 && input.Value.Div(RateDecimals) < 1, "Invalid input");
            Assert(Context.Sender == State.Admin.Value, "No permission");
            State.BonusRate.Value = input.Value;
            return new Empty();
        }

        public override Empty SetAdmin(Address input)
        {
            Assert(input != null,"Invalid input");
            Assert(Context.Sender == State.Admin.Value, "No permission");
            State.Admin.Value = input;
            return new Empty();
        }
    }
}