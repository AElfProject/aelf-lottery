using AElf.Contracts.MultiToken;
using AElf.CSharp.Core;
using AElf.CSharp.Core.Extension;
using AElf.Sdk.CSharp;
using AElf.Types;
using Google.Protobuf.WellKnownTypes;

namespace AElf.Contracts.LotteryContract
{
    public partial class LotteryContract : LotteryContractContainer.LotteryContractBase
    {
        public override Empty Initialize(InitializeInput input)
        {
            Assert(input.Price > 0 && input.CashDuration > 0, "Invalid input");
            Assert(State.TokenSymbol.Value == null, "Already initialized");
            
            State.Admin.Value = Context.Sender;
            
            Assert(Context.Sender == State.Admin.Value, "No permission");
            State.TokenContract.Value =
                Context.GetContractAddressByName(SmartContractConstants.TokenContractSystemName);
            var tokenInfo = State.TokenContract.GetTokenInfo.Call(new GetTokenInfoInput
            {
                Symbol = input.TokenSymbol
            });
            Assert(tokenInfo != null && !string.IsNullOrEmpty(tokenInfo.Symbol), "Invalid token symbol");
            State.TokenSymbol.Value = input.TokenSymbol;
            State.Price.Value = input.Price;
            InitRewards(tokenInfo.Decimals);
            
            SetBonusRate(input.BonusRate);
            SetProfitsRate(input.ProfitsRate);
            State.CashDuration.Value = input.CashDuration;
            
            State.CurrentPeriodNumber.Value = 1;
            var date = Context.CurrentBlockTime.ToDateTime().ToString("yyyyMMdd");
            State.StartPeriodNumberOfDay[date] = 1;
            State.CurrentLotteryId.Value = 1;
            State.Periods[1] = new PeriodBody
            {
                PeriodNumber = 1,
                BlockNumber = Context.CurrentHeight,
                CreateTime = Context.CurrentBlockTime,
                RandomHash = Hash.Empty
            };
            
            State.AEDPoSContract.Value =
                Context.GetContractAddressByName(SmartContractConstants.ConsensusContractSystemName);
            
            State.RewardsAmountBoard.Value = new RewardsAmountBoard
            {
                MaximalCount = 10
            };
            
            State.TotalPeriodCountBoard.Value = new RewardsAmountBoard
            {
                MaximalCount = 10
            };

            InitializeTokenHolderProfitScheme();
            return new Empty();
        }

        public override Empty Buy(BuyInput input)
        {
            var currentPeriod = State.Periods[State.CurrentPeriodNumber.Value];
            Assert(currentPeriod.DrawTime == null, $"Period {State.CurrentPeriodNumber.Value} has been drew.");
            var lotteryType = (LotteryType) input.Type;
            var bit = GetBit(lotteryType);
            Assert(bit.ValidateBetInfos(input.BetInfos), "Invalid bet info");
            var betCount = bit.CalculateBetCount(input.BetInfos);
            var totalAmount = State.Price.Value.Mul(betCount);
            var bonus = totalAmount.Mul(State.BonusRate.Value).Div(GetRateDenominator());
            State.TokenContract.TransferFrom.Send(new TransferFromInput
            {
                From = Context.Sender,
                To = Context.Self,
                Symbol = State.TokenSymbol.Value,
                Amount = totalAmount.Sub(bonus)
            });
            State.TokenContract.TransferFrom.Send(new TransferFromInput
            {
                From = Context.Sender,
                To = input.Seller,
                Symbol = State.TokenSymbol.Value,
                Amount = bonus
            });
            var lotteryId = State.CurrentLotteryId.Value;
            var lottery = new Lottery
            {
                Id = lotteryId,
                BetInfos = {input.BetInfos},
                Bonus = bonus,
                Seller = input.Seller,
                Owner = Context.Sender,
                PeriodNumber = State.CurrentPeriodNumber.Value,
                Price = State.Price.Value,
                BlockNumber = Context.CurrentHeight,
                CreateTime = Context.CurrentBlockTime,
                Type = (LotteryType) input.Type
            };
            State.Lotteries[lotteryId] = lottery;
            AddUnDrawnLottery(Context.Sender, lotteryId);
            State.CurrentLotteryId.Value = lotteryId.Add(1);
            
            ClearExpiredToBeClaimedLotteries();
            ContributeProfits(totalAmount.Mul(State.ProfitRate.Value).Div(GetRateDenominator()));
            
            return new Empty();
        }

        public override Empty Draw(Int64Value input)
        {
            var currentPeriodNumber = State.CurrentPeriodNumber.Value;
            Assert(input.Value.Add(1) == currentPeriodNumber, "Incorrect period.");
            Assert(currentPeriodNumber > 1, "Not ready to draw.");
            Assert(Context.Sender == State.Admin.Value, "No permission to draw!");

            var previousPeriodNumber = currentPeriodNumber.Sub(1);
            var previousPeriod = State.Periods[previousPeriodNumber];
            Assert(previousPeriod.DrawTime == null, "Latest period already drawn.");

            var currentPeriod = State.Periods[currentPeriodNumber];
            var expectedBlockNumber = currentPeriod.BlockNumber;
            Assert(Context.CurrentHeight >= expectedBlockNumber, "Block height not enough.");

            previousPeriod.RandomHash = State.AEDPoSContract.GetRandomHash.Call(new Int64Value
            {
                Value = expectedBlockNumber
            });
            previousPeriod.LuckyNumber = (int) Context.ConvertHashToInt64(previousPeriod.RandomHash, 0, 100000);
            previousPeriod.DrawTime = Context.CurrentBlockTime;
            previousPeriod.DrawBlockNumber = Context.CurrentHeight;
            State.Periods[previousPeriodNumber] = previousPeriod;
            
            return new Empty();
        }

        public override Empty PrepareDraw(Empty input)
        {
            Assert(Context.Sender == State.Admin.Value, "No permission to prepare!");

            // Check whether current period drew except period 1.
            if (State.CurrentPeriodNumber.Value != 1)
            {
                Assert(State.Periods[State.CurrentPeriodNumber.Value.Sub(1)].DrawTime != null,
                    $"Period {State.CurrentPeriodNumber.Value.Sub(1)} hasn't drew.");
            }

            State.CurrentPeriodNumber.Value = State.CurrentPeriodNumber.Value.Add(1);

            // init next period
            var period = new PeriodBody
            {
                PeriodNumber = State.CurrentPeriodNumber.Value,
                BlockNumber = Context.CurrentHeight,
                RandomHash = Hash.Empty,
                CreateTime = Context.CurrentBlockTime
            };

            State.Periods[State.CurrentPeriodNumber.Value] = period;
            
            var date = Context.CurrentBlockTime.ToDateTime().ToString("yyyyMMdd");
            if (State.StartPeriodNumberOfDay[date] == 0) State.StartPeriodNumberOfDay[date] = period.PeriodNumber;

            return new Empty();
        }

        public override Empty TakeReward(TakeRewardInput input)
        {
            var lottery = State.Lotteries[input.LotteryId];
            Assert(lottery != null, "Lottery not found.");
            Assert(lottery.Owner == Context.Sender, "Cannot take reward for other people's lottery.");
            Assert(!lottery.Cashed, "Lottery has been cashed");
            var period = State.Periods[lottery.PeriodNumber];
            Assert(period.DrawTime != null, $"Period {lottery.PeriodNumber} hasn't drew");

            UpdateUnDrawnLottery(Context.Sender);
            lottery.Reward = CalculateReward(lottery, period.LuckyNumber);
            if (lottery.Reward > 0)
            {
                Assert(period.DrawTime.AddDays(State.CashDuration.Value) >= Context.CurrentBlockTime,
                    "Cannot cash expired lottery.");
                State.TokenContract.Transfer.Send(new TransferInput
                {
                    To = lottery.Owner,
                    Amount = lottery.Reward,
                    Symbol = State.TokenSymbol.Value
                });
                State.LatestCashedLotteryId.Value = lottery.Id;

                State.RewardsAmount[Context.Sender] = State.RewardsAmount[Context.Sender].Add(lottery.Reward);

                RemoveToBeClaimedLottery(input.LotteryId);
                AddDoneLottery(input.LotteryId);
                TryUpdateRewardsAmountBoard(Context.Sender);
            }

            lottery.Cashed = true;
            State.Lotteries[input.LotteryId] = lottery;

            ClearExpiredToBeClaimedLotteries();

            return new Empty();
        }

        public override Empty SetBonusRate(Int32Value input)
        {
            SetBonusRate(input.Value);
            return new Empty();
        }

        public override Empty SetProfitsRate(Int32Value input)
        {
            SetProfitsRate(input.Value);
            return new Empty();
        }

        public override Empty SetAdmin(Address input)
        {
            Assert(Context.Sender == State.Admin.Value, "No permission");
            State.Admin.Value = input;
            return new Empty();
        }

        public override Empty SetPrice(Int64Value input)
        {
            Assert(Context.Sender == State.Admin.Value, "No permission");
            State.Price.Value = input.Value;
            return new Empty();
        }

        public override Empty SetCashDuration(Int32Value input)
        {
            Assert(Context.Sender == State.Admin.Value, "No permission");
            State.CashDuration.Value = input.Value;
            return new Empty();
        }

        public override Empty TakeBackToken(TakeBackTokenInput input)
        {
            Assert(Context.Sender == State.Admin.Value, "No permission.");
            State.TokenContract.Transfer.Send(new TransferInput
            {
                Amount = input.Amount,
                Symbol = input.Symbol,
                To = State.Admin.Value
            });
            
            return new Empty();
        }
    }
}