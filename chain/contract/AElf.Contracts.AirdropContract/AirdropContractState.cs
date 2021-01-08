using AElf.Contracts.MultiToken;
using AElf.Sdk.CSharp.State;
using AElf.Types;

namespace AElf.Contracts.AirdropContract
{
    public class AirdropContractState : ContractState
    {
        public SingletonState<Address> Owner { get; set; }

        public MappedState<long, AirdropInfo> Airdrops { get; set; }
        
        public MappedState<string, long> AirdropAmounts { get; set; }
        
        public Int64State AirdropCount { get; set; }
        
        internal TokenContractContainer.TokenContractReferenceState TokenContract { get; set; }
    }
}