namespace AElf.Contracts.LotteryContract
{
    public partial class LotteryContract
    {
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
                StartPeriodOfDay = State.StartPeriodOfDay[date]
            };
        }

        private LotteryDetail GetLotteryDetail(long lotteryId)
        {
            var lottery = State.Lotteries[lotteryId];
            if (lottery == null) return null;
            Assert(lottery.Owner == Context.Sender, "Cannot query other people's lottery");
            var period = State.Periods[lottery.Period];
            var date = period.CreateTime.ToDateTime().ToString("yyyyMMdd");
            return new LotteryDetail
            {
                Id = lottery.Id,
                Bets = {lottery.BetInfos},
                Cashed = lottery.Cashed,
                Period = lottery.Period,
                Price = lottery.Price,
                Reward = lottery.Reward,
                Type = lottery.Type,
                CreateTime = lottery.CreateTime,
                StartPeriodOfDay = State.StartPeriodOfDay[date]
            };
        }
    }
}