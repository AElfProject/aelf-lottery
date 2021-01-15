using AElf.Standards.ACS0;
using AElf.Contracts.Consensus.AEDPoS;
using AElf.Contracts.MultiToken;
using AElf.Sdk.CSharp.State;
using AElf.Types;

namespace AElf.Contracts.LotteryContract
{
    public class LotteryContractState : ContractState
    {
        internal AEDPoSContractContainer.AEDPoSContractReferenceState AEDPoSContract { get; set; }
        internal TokenContractContainer.TokenContractReferenceState TokenContract { get; set; }
        internal ACS0Container.ACS0ReferenceState GenesisContract { get; set; }
        
        public StringState TokenSymbol { get; set; }
        
        public SingletonState<long> Price { get; set; }
        
        public SingletonState<int> CashDuration { get; set; }
        
        public SingletonState<int> BonusRate { get; set; }

        public SingletonState<Address> Admin { get; set; }
        
        public MappedState<long, PeriodBody> Periods { get; set; }

        public MappedState<string, long> StartPeriodNumberOfDay { get; set; }
        
        public MappedState<long, Lottery> Lotteries { get; set; }
        
        // public MappedState<Address, LotteryList> UnDoneLotteries { get; set; }
        public MappedState<Address, LotteryList> ToBeClaimedLotteries { get; set; }
        public MappedState<Address, UnDrawnLotteries> UnDrawnLotteries { get; set; }

        public MappedState<Address, LotteryList> DoneLotteries { get; set; }
        
        public SingletonState<long> LatestCashedLotteryId { get; set; }
        
        public SingletonState<long> CurrentPeriodNumber { get; set; }
        
        public SingletonState<long> CurrentLotteryId { get; set; }

        public MappedState<LotteryType, long> Rewards { get; set; }
        public MappedState<Address, long> RewardsAmount { get; set; }
        public MappedState<Address, long> TotalPeriodCount { get; set; }
        
        public SingletonState<RewardsAmountBoard> RewardsAmountBoard { get; set; }
        public SingletonState<RewardsAmountBoard> TotalPeriodCountBoard { get; set; }
    }
}