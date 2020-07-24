using System.Collections;
using System.Collections.Generic;
using System.Linq;
using AElf.CSharp.Core;
using AElf.CSharp.Core.Extension;
using AElf.Sdk.CSharp;

namespace AElf.Contracts.LotteryContract
{
    public partial class LotteryContract
    {
        private void InitRewards(int decimals)
        {
            State.Rewards[LotteryType.Simple] = 4 * decimals;
            State.Rewards[LotteryType.OneBit] = 10 * decimals;
            State.Rewards[LotteryType.TwoBit] = 100 * decimals;
            State.Rewards[LotteryType.ThreeBit] = 1000 * decimals;
            State.Rewards[LotteryType.FiveBit] = 100000 * decimals;
        }
        
        private PeriodDetail GetPeriodDetail(long periodNumber)
        {
            var period = State.Periods[periodNumber];
            if (period == null) return null;
            var date = period.CreateTime.ToDateTime().ToString("yyyyMMdd");
            return new PeriodDetail
            {
                BlockNumber = period.BlockNumber,
                CreateTime = period.CreateTime,
                DrawTime = period.DrawTime,
                LuckyNumber = period.LuckyNumber,
                RandomHash = period.RandomHash,
                DrawBlockNumber = period.DrawBlockNumber,
                StartPeriodOfDay = State.StartPeriodNumberOfDay[date]
            };
        }
        
        private PeriodBody GetLatestDrawPeriod()
        {
            var currentPeriodNumber = State.CurrentPeriodNumber.Value;
            var period = State.Periods[currentPeriodNumber];
            while (period != null)
            {
                if (period.DrawTime != null) return period;
                period = State.Periods[period.PeriodNumber.Sub(1)];
            }
            
            return null;
        }
        
        private void DealUnDoneLotteries()
        {
            var lotteryIds = State.UnDoneLotteries[Context.Sender].Ids.ToList();
            var latestDrawPeriod = GetLatestDrawPeriod();
            //TODO consider lotteryIds count is very large.
            foreach (var lotteryId in lotteryIds)
            {
                var lottery = State.Lotteries[lotteryId];
                if (latestDrawPeriod == null || lottery.PeriodNumber > latestDrawPeriod.PeriodNumber) continue;
                var period = State.Periods[lottery.PeriodNumber];
                lottery.Reward = CalculateReward(lottery, period.LuckyNumber);
                lottery.Expired = period.DrawTime.AddDays(State.CashDuration.Value) < Context.CurrentBlockTime;
                lottery.Cashed = lottery.Reward == 0;
                State.Lotteries[lotteryId] = lottery;
                if (lottery.Reward > 0 && !lottery.Expired) continue;
                State.UnDoneLotteries[Context.Sender].Ids.Remove(lotteryId);
                State.DoneLotteries[Context.Sender].Ids.Add(lotteryId);
            }
        }

        private LotteryDetail GetLotteryDetail(long lotteryId)
        {
            var lottery = State.Lotteries[lotteryId];
            if (lottery == null) return null;
            Assert(lottery.Owner == Context.Sender, "Cannot query other people's lottery");
            var period = State.Periods[lottery.PeriodNumber];
            var date = period.CreateTime.ToDateTime().ToString("yyyyMMdd");

            var reward = !lottery.Cashed && lottery.Reward == 0 && period.DrawTime != null
                ? CalculateReward(lottery, period.LuckyNumber)
                : lottery.Reward;

            return new LotteryDetail
            {
                Id = lottery.Id,
                BetInfos = {lottery.BetInfos},
                Cashed = lottery.Cashed,
                PeriodNumber = lottery.PeriodNumber,
                Price = lottery.Price,
                Reward = reward,
                Type = lottery.Type,
                BlockNumber = lottery.BlockNumber,
                CreateTime = lottery.CreateTime,
                StartPeriodOfDay = State.StartPeriodNumberOfDay[date],
                Expired = lottery.Expired || period.DrawTime != null &&
                          period.DrawTime.AddDays(State.CashDuration.Value) < Context.CurrentBlockTime
            };
        }

        private long CalculateReward(Lottery lottery, int luckNumber)
        {
            var bit = GetBit(lottery.Type);
            return !bit.CheckWin(luckNumber, lottery.BetInfos)
                ? 0
                : State.Rewards[lottery.Type].Mul(lottery.Rate).Div(RateDecimals);
        }

        private List<LotteryType> GetLotteryTypes()
        {
            return new List<LotteryType>
            {
                LotteryType.Simple,
                LotteryType.OneBit,
                LotteryType.TwoBit,
                LotteryType.ThreeBit,
                LotteryType.FiveBit
            };
        }
        
        private IBit GetBit(LotteryType type)
        {
            switch (type)
            {
                case LotteryType.Simple:
                    return new SimpleBit();
                case LotteryType.OneBit:
                    return new OneBit();
                case LotteryType.TwoBit:
                    return new TwoBit();
                case LotteryType.ThreeBit:
                    return new ThreeBit();
                case LotteryType.FiveBit:
                    return new FiveBit();
                default:
                    throw new AssertionException("Invalid lottery type");
            }
        }

        private static int Pow(int x, uint y)
        {
            if (y == 1)
                return x;
            int a = 1;
            if (y == 0)
                return a;
            var e = new BitArray(y.ToBytes(false));
            var t = e.Count;
            for (var i = t - 1; i >= 0; --i)
            {
                a *= a;
                if (e[i])
                {
                    a *= x;
                }
            }

            return a;
        }
    }
}