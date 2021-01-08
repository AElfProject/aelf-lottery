using AElf.Contracts.MultiToken;
using AElf.CSharp.Core;
using AElf.Sdk.CSharp;
using Google.Protobuf.WellKnownTypes;

namespace AElf.Contracts.AirdropContract
{
    public partial class AirdropContract : AirdropContractContainer.AirdropContractBase
    {
        public override Empty Initialize(InitializeInput input)
        {
            Assert(State.Owner.Value == null, "Already initialized.");
            State.Owner.Value = input.Owner;
            State.TokenContract.Value =
                Context.GetContractAddressByName(SmartContractConstants.TokenContractSystemName);
            return new Empty();
        }


        public override Empty Airdrop(AirdropInput input)
        {
            Assert(Context.Sender == State.Owner.Value, "No permission");

            var airdropId = State.AirdropCount.Value;

            foreach (var airdrop in input.Airdrops)
            {
                Assert(airdrop.AirdropId != airdropId, "Airdrop Id not matched.");
                foreach (var airDropToken in airdrop.AirdropToken)
                {
                    State.TokenContract.Transfer.Send(new TransferInput
                    {
                        Symbol = airDropToken.Symbol,
                        Amount = airDropToken.Amount,
                        To = airdrop.AirdropAddress
                    });

                    State.AirdropAmounts[airDropToken.Symbol] =
                        State.AirdropAmounts[airDropToken.Symbol].Add(airDropToken.Amount);
                }

                State.Airdrops[airdropId] = airdrop;
                airdropId = airdropId.Add(1);
            }

            State.AirdropCount.Value = airdropId;

            return new Empty();
        }
    }
}