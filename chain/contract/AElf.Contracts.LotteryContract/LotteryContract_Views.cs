using System.Collections.Generic;
using System.Linq;
using AElf.CSharp.Core;
using AElf.Types;
using Google.Protobuf.WellKnownTypes;

namespace AElf.Contracts.LotteryContract
{
    public partial class LotteryContract
    {
        public override GetPeriodsOutput GetPeriods(GetPeriodsInput input)
        {
            Assert(input.StartPeriodNumber > 0 && input.Limit > 0, "Invalid input");
            Assert(input.Limit <= MaxQueryLimit, $"Limit should be less than {MaxQueryLimit}");
            var periodDetails = new List<PeriodDetail>();
            var periodNumber = input.StartPeriodNumber;
            while (periodDetails.Count < input.Limit)
            {
                var periodDetail = GetPeriodDetail(periodNumber);
                if(periodDetail == null) break;
                periodDetails.Add(periodDetail);
                periodNumber--;
            }

            return new GetPeriodsOutput
            {
                Periods = {periodDetails}
            };
        }

        public override GetLotteryOutput GetLottery(GetLotteryInput input)
        {
            return new GetLotteryOutput
            {
                Lottery = GetLotteryDetail(input.LotteryId)
            };
        }

        public override GetLotteriesOutput GetLotteries(GetLotteriesInput input)
        {
            Assert(input.Offset >= 0 && input.Limit > 0, "Invalid input");
            Assert(input.Limit <= MaxQueryLimit, $"Limit should be less than {MaxQueryLimit}");
            var address = Context.Sender;
            var lotteries = State.UnDoneLotteries[address] ?? new LotteryList();
            var doneLotteries = State.DoneLotteries[address] ?? new LotteryList();
            lotteries.Ids.AddRange(doneLotteries.Ids);
            var ids = lotteries.Ids.OrderByDescending(id => id);
            var lotteryIdList = ids.Skip(input.Offset).Take(input.Limit).ToList();
            var lotteryDetails = new List<LotteryDetail>();
            foreach (var lotteryId in lotteryIdList)
            {
                var lotteryDetail = GetLotteryDetail(lotteryId);
                if (lotteryDetail == null) break;
                lotteryDetails.Add(lotteryDetail);
            }

            return new GetLotteriesOutput
            {
                Lotteries = {lotteryDetails}
            };
        }

        public override GetLotteriesOutput GetRewardedLotteries(GetLotteriesInput input)
        {
            return base.GetRewardedLotteries(input);
        }

        public override PeriodDetail GetPeriod(Int64Value input)
        {
            return GetPeriodDetail(input.Value);
        }

        public override PeriodDetail GetLatestDrawPeriod(Empty input)
        {
            var currentPeriodId = State.CurrentPeriod.Value;
            var periodDetail = GetPeriodDetail(currentPeriodId);
            while (periodDetail != null)
            {
                if (periodDetail.DrawTime != null) return periodDetail;
                periodDetail = GetPeriodDetail(periodDetail.Period.Sub(1));
            }
            
            return null;
        }

        public override Int64Value GetCurrentPeriodNumber(Empty input)
        {
            return new Int64Value
            {
                Value = State.CurrentPeriod.Value
            }; 
        }

        public override PeriodDetail GetCurrentPeriod(Empty input)
        {
            return GetPeriodDetail(State.CurrentPeriod.Value);
        }

        public override Int64Value GetPrice(Empty input)
        {
            return new Int64Value{
                Value = State.Price.Value
            };
        }

        public override StringValue GetTokenSymbol(Empty input)
        {
            return new StringValue
            {
                Value = State.TokenSymbol.Value
            }; 
        }

        public override Int32Value GetCashDuration(Empty input)
        {
            return new Int32Value
            {
                Value = State.CashDuration.Value
            };
        }

        public override GetRateOutput GetBonusRate(Empty input)
        {
            return new GetRateOutput
            {
                Rate = State.BonusRate.Value,
                Decimals = RateDecimals
            };
        }

        public override GetRateOutput GetMaxRate(Empty input)
        {
            return new GetRateOutput
            {
                Rate = State.MaxRate.Value,
                Decimals = RateDecimals
            };
        }

        public override GetRateOutput GetMinRate(Empty input)
        {
            return new GetRateOutput
            {
                Rate = State.MinRate.Value,
                Decimals = RateDecimals
            };
        }

        public override Address GetAdmin(Empty input)
        {
            return State.Admin.Value;
        }
    }
}