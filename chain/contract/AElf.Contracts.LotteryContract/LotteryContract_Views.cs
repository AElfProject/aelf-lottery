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
                if (periodDetail == null) break;
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
            Assert(input.Offset >= 0 && input.Limit > 0, "Invalid input");
            Assert(input.Limit <= MaxQueryLimit, $"Limit should be less than {MaxQueryLimit}");
            var address = Context.Sender;
            var lotteries = State.UnDoneLotteries[address] ?? new LotteryList();
            var lotteryIdList = lotteries.Ids.OrderByDescending(id => id);
            var lotteryDetails = new List<LotteryDetail>();
            foreach (var lotteryId in lotteryIdList)
            {
                var lotteryDetail = GetLotteryDetail(lotteryId);
                if (lotteryDetail == null) break;
                if (lotteryDetail.Reward == 0 || lotteryDetail.Expired) continue;
                lotteryDetails.Add(lotteryDetail);
                if (lotteryDetails.Count >= input.Offset + input.Limit) break;
            }

            return new GetLotteriesOutput
            {
                Lotteries = {lotteryDetails.Skip(input.Offset).Take(input.Limit)}
            };
        }

        public override GetLatestCashedLotteryOutput GetLatestCashedLottery(Empty input)
        {
            if (State.LatestCashedLotteryId.Value == 0) return new GetLatestCashedLotteryOutput();
            var lottery = State.Lotteries[State.LatestCashedLotteryId.Value];
            var period = State.Periods[lottery.PeriodNumber];
            var date = period.CreateTime.ToDateTime().ToString("yyyyMMdd");
            return new GetLatestCashedLotteryOutput
            {
                Address = lottery.Owner,
                Type = (int) lottery.Type,
                PeriodNumber = lottery.PeriodNumber,
                StartPeriodNumberOfDay = State.StartPeriodNumberOfDay[date]
            };
        }

        public override PeriodDetail GetPeriod(Int64Value input)
        {
            return GetPeriodDetail(input.Value);
        }

        public override PeriodDetail GetLatestDrawPeriod(Empty input)
        {
            var currentPeriodNumber = State.CurrentPeriodNumber.Value;
            var periodDetail = GetPeriodDetail(currentPeriodNumber);
            while (periodDetail != null)
            {
                if (periodDetail.DrawTime != null) return periodDetail;
                periodDetail = GetPeriodDetail(periodDetail.PeriodNumber.Sub(1));
            }
            
            return null;
        }

        public override Int64Value GetCurrentPeriodNumber(Empty input)
        {
            return new Int64Value
            {
                Value = State.CurrentPeriodNumber.Value
            }; 
        }

        public override PeriodDetail GetCurrentPeriod(Empty input)
        {
            return GetPeriodDetail(State.CurrentPeriodNumber.Value);
        }

        public override Int64Value GetPrice(Empty input)
        {
            return new Int64Value
            {
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

        public override Address GetAdmin(Empty input)
        {
            return State.Admin.Value;
        }

        public override GetRewardsOutput GetRewards(Empty input)
        {
            var output = new GetRewardsOutput();
            var lotteryTypes = GetLotteryTypes();
            foreach (var lotteryType in lotteryTypes)
            {
                output.Rewards.Add(new RewardDetail
                {
                    Type = (int) lotteryType,
                    Amount = State.Rewards[lotteryType]
                });
            }

            return output;
        }
    }
}