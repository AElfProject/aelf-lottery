using System.Linq;
using AElf.CSharp.Core;
using Google.Protobuf.Collections;

namespace AElf.Contracts.LotteryContract
{
    public partial class LotteryContract
    {
        private interface IBit
        {
            bool ValidateBetInfos(RepeatedField<BetBody> betInfos);

            int CalculateBetCount(RepeatedField<BetBody> betInfos);

            bool CheckWin(int luckNumber, RepeatedField<BetBody> betInfos);
        }
    
        private abstract class BitBase
        {
            protected abstract int BitCount { get; }
            protected virtual int MaxNumber => 9;
        
            public bool ValidateBetInfos(RepeatedField<BetBody> betInfos)
            {
                return betInfos.Count == BitCount &&
                       betInfos.All(betInfo =>
                           betInfo.Bets.Count == betInfo.Bets.Distinct().Count() && ValidateBets(betInfo.Bets));
            }

            private bool ValidateBets(RepeatedField<int> bets)
            {
                return bets.All(bet => bet <= MaxNumber && bet >= 0);
            }
        
            public int CalculateBetCount(RepeatedField<BetBody> betInfos)
            {
                return betInfos.Aggregate(1, (current, betInfo) => current * betInfo.Bets.Count);
            }

            public virtual bool CheckWin(int luckNumber, RepeatedField<BetBody> betInfos)
            {
                for (var i = 0; i < BitCount; i++)
                {
                    var number = luckNumber.Div(Pow(10, (uint) i)) % 10;
                    if (betInfos[i].Bets.All(bet => bet != number)) return false;
                }

                return true;
            }
        }

        private class SimpleBit : BitBase, IBit
        {
            private const int Even = 0;
            private const int Odd = 1;
            private const int Low = 2;
            private const int High = 3;

            protected override int MaxNumber => 3;

            protected override int BitCount => 2;

            public override bool CheckWin(int luckNumber, RepeatedField<BetBody> betInfos)
            {
                for (var i = 0; i < BitCount; i++)
                {
                    var simpleNumbers = new int[2];
                    var number = luckNumber.Div(Pow(10, (uint) i)) % 10;
                    simpleNumbers[0] = number % 2 == 0 ? Even : Odd;
                    simpleNumbers[1] = number > 4 ? High : Low;
                    if (betInfos[i].Bets.All(bet => !simpleNumbers.Contains(bet))) return false;
                }

                return true;
            }
        }

        private class OneBit : BitBase, IBit
        {
            protected override int BitCount => 1;
        }

        private class TwoBit : BitBase, IBit
        {
            protected override int BitCount => 2;
        }
    
        private class ThreeBit : BitBase, IBit
        {
            protected override int BitCount => 3;
        }
    
        private class FiveBit : BitBase, IBit
        {
            protected override int BitCount => 5;
        }
    }
}