using AElf.Sdk.CSharp;
using Google.Protobuf.WellKnownTypes;

namespace AElf.Contracts.AirdropContract
{
    public partial class AirdropContract
    {
        [View]
        public override Int64Value GetAirdropAmount(StringValue input)
        {
            return new Int64Value {Value = State.AirdropAmounts[input.Value]};
        }

        [View]
        public override Int64Value GetAirdropCount(Empty input)
        {
            return new Int64Value {Value = State.AirdropCount.Value};
        }

        [View]
        public override AirdropInfo GetAirdropInfo(Int64Value input)
        {
            return State.Airdrops[input.Value];
        }
    }
}