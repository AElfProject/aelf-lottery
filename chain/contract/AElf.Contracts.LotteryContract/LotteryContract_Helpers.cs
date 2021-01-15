using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using AElf.CSharp.Core;
using AElf.CSharp.Core.Extension;
using AElf.Sdk.CSharp;
using AElf.Types;
using Google.Protobuf.Collections;

namespace AElf.Contracts.LotteryContract
{
    public partial class LotteryContract
    {
        private void InitRewards(int decimals)
        {
            long pow = Pow(10, (uint) decimals);
            State.Rewards[LotteryType.Simple] = pow.Mul(4);
            State.Rewards[LotteryType.OneBit] = pow.Mul(10);
            State.Rewards[LotteryType.TwoBit] = pow.Mul(100);
            State.Rewards[LotteryType.ThreeBit] = pow.Mul(1000);
            State.Rewards[LotteryType.FiveBit] = pow.Mul(100000);
        }
        
        private PeriodDetail GetPeriodDetail(long periodNumber)
        {
            var period = State.Periods[periodNumber];
            if (period == null) return null;
            var date = period.CreateTime.ToDateTime().ToString("yyyyMMdd");
            return new PeriodDetail
            {
                PeriodNumber = period.PeriodNumber,
                BlockNumber = period.BlockNumber,
                CreateTime = period.CreateTime,
                DrawTime = period.DrawTime,
                LuckyNumber = period.LuckyNumber,
                RandomHash = period.RandomHash,
                DrawBlockNumber = period.DrawBlockNumber,
                StartPeriodNumberOfDay = State.StartPeriodNumberOfDay[date]
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

        private void AddDoneLottery(long lotteryId)
        {
            var lotteryList = State.DoneLotteries[Context.Sender] ?? new LotteryList();
            lotteryList.Ids.Add(lotteryId);
            State.DoneLotteries[Context.Sender] = lotteryList;
        }
        
        private void AddToBeClaimedLottery(long lotteryId)
        {
            var lotteryList = State.ToBeClaimedLotteries[Context.Sender] ?? new LotteryList();
            lotteryList.Ids.Add(lotteryId);
            State.ToBeClaimedLotteries[Context.Sender] = lotteryList;
        }

        private void AddUnDrawnLottery(Address address, long lotteryId)
        {
            var lotteryList = UpdateUnDrawnLottery(address);
            lotteryList.Ids.Add(lotteryId);
            State.UnDrawnLotteries[address] = lotteryList;
        }

        private UnDrawnLotteries UpdateUnDrawnLottery(Address address)
        {
            var lotteryList = State.UnDrawnLotteries[address] ?? new UnDrawnLotteries();
            if (lotteryList.PeriodNumber == 0 || TryAddUnDrawnLotteries(lotteryList))
            {
                // should update period number 
                lotteryList.Ids.Clear();
                lotteryList.PeriodNumber = State.CurrentPeriodNumber.Value;
            }

            State.UnDrawnLotteries[address] = lotteryList;
            return lotteryList;
        }

        private bool TryAddUnDrawnLotteries(UnDrawnLotteries unDrawnLotteries)
        {
            var latestDrawPeriod = GetLatestDrawPeriod();
            if (latestDrawPeriod == null || unDrawnLotteries == null || unDrawnLotteries.PeriodNumber > latestDrawPeriod.PeriodNumber)
                return false;
            
            // the period already drawn, should move to unClaimedLotteries
            foreach (var lotteryId in unDrawnLotteries.Ids)
            {
                var lottery = State.Lotteries[lotteryId];
                if (lottery.Cashed)
                    continue; // already claimed
                
                var period = State.Periods[lottery.PeriodNumber];
                lottery.Reward = CalculateReward(lottery, period.LuckyNumber);
                lottery.Expired = lottery.Reward > 0 && period.DrawTime.AddDays(State.CashDuration.Value) < Context.CurrentBlockTime;
                lottery.Cashed = lottery.Reward == 0;
                State.Lotteries[lotteryId] = lottery;
                if (lottery.Reward == 0 || lottery.Expired)
                {
                    // expired or nothing to claim
                    AddDoneLottery(lotteryId);
                }
                else
                    AddToBeClaimedLottery(lotteryId);
            }

            return true;
        }

        private void RemoveToBeClaimedLottery(long lotteryId)
        {
            var lotteryList = State.ToBeClaimedLotteries[Context.Sender] ?? new LotteryList();
            lotteryList.Ids.Remove(lotteryId);
            State.ToBeClaimedLotteries[Context.Sender] = lotteryList;
        }
        
        private void ClearExpiredToBeClaimedLotteries()
        {
            var lotteryList = State.ToBeClaimedLotteries[Context.Sender] ?? new LotteryList();
            var lotteryIds = lotteryList.Ids.ToList();
            var latestDrawPeriod = GetLatestDrawPeriod();
            //TODO consider lotteryIds count is very large.
            foreach (var lotteryId in lotteryIds)
            {
                var lottery = State.Lotteries[lotteryId];
                if (latestDrawPeriod == null || lottery.PeriodNumber > latestDrawPeriod.PeriodNumber) break;
                var period = State.Periods[lottery.PeriodNumber];
                // lottery.Reward = CalculateReward(lottery, period.LuckyNumber);
                lottery.Expired = lottery.Reward > 0 && period.DrawTime.AddDays(State.CashDuration.Value) < Context.CurrentBlockTime;
                lottery.Cashed = lottery.Reward == 0;
                State.Lotteries[lotteryId] = lottery;
                if (!lottery.Expired) break;
                
                // already expired
                lotteryList.Ids.Remove(lotteryId);
                AddDoneLottery(lotteryId);
            }
            
            State.ToBeClaimedLotteries[Context.Sender] = lotteryList;
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
                Type = (int)lottery.Type,
                BlockNumber = lottery.BlockNumber,
                CreateTime = lottery.CreateTime,
                StartPeriodNumberOfDay = State.StartPeriodNumberOfDay[date],
                Expired = lottery.Expired || period.DrawTime != null && !lottery.Cashed && reward > 0 &&
                          period.DrawTime.AddDays(State.CashDuration.Value) < Context.CurrentBlockTime
            };
        }
        
        private void SetBonusRate(int bonusRate)
        {
            Assert(bonusRate > 0 && bonusRate.Div(GetRateDenominator()) < 1, "Invalid bonus rate");
            Assert(Context.Sender == State.Admin.Value, "No permission");
            State.BonusRate.Value = bonusRate;
        }

        private long CalculateReward(Lottery lottery, int luckNumber)
        {
            var bit = GetBit(lottery.Type);
            return bit.GetWinBetCount(luckNumber, lottery.BetInfos) * State.Rewards[lottery.Type];
        }

        private int GetRateDenominator()
        {
            return Pow(10, RateDecimals);
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

        private void TryUpdateRewardsAmountBoard(Address newer)
        {
            var rewardsAmountBoard = State.RewardsAmountBoard.Value;
            var list = rewardsAmountBoard.Board.ToList();
            
            if (!rewardsAmountBoard.Board.Contains(newer))
                list.Add(newer);

            list = list.OrderByDescending(r => State.RewardsAmount[r])
                .Take((int) Math.Min(list.Count, rewardsAmountBoard.MaximalCount)).ToList();

            rewardsAmountBoard.Board.Clear();
            rewardsAmountBoard.Board.AddRange(list);
            State.RewardsAmountBoard.Value = rewardsAmountBoard;
        }
    }
}