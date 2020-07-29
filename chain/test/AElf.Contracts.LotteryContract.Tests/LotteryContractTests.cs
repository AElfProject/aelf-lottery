using System;
using System.Threading.Tasks;
using AElf.Contracts.MultiToken;
using AElf.ContractTestBase.ContractTestKit;
using AElf.Types;
using Google.Protobuf.WellKnownTypes;
using Shouldly;
using Xunit;

namespace AElf.Contracts.LotteryContract
{
    // ReSharper disable InconsistentNaming
    public class LotteryContractTests : LotteryContractTestBase
    {
        private const long Price = 100_000_000;

        private TokenContractContainer.TokenContractStub AliceTokenContractStub => GetTokenContractStub(AliceKeyPair);

        private LotteryContractContainer.LotteryContractStub BobLotteryContractStub =>
            GetLotteryContractStub(BobKeyPair);

        private TokenContractContainer.TokenContractStub BobTokenContractStub => GetTokenContractStub(BobKeyPair);

        private async Task<InitializeInput> InitializeAsync()
        {
            var initializeInput = new InitializeInput
            {
                TokenSymbol = "ELF",
                Price = Price,
                BonusRate = 100,
                CashDuration = 60
            };
            await LotteryContractStub.Initialize.SendAsync(initializeInput);
            
            //Transfer some money to Alice & Bob.
            await TokenContractStub.Transfer.SendAsync(new TransferInput
            {
                To = AliceAddress,
                Symbol = "ELF",
                Amount = 100000000_00000000
            });
            
            await TokenContractStub.Transfer.SendAsync(new TransferInput
            {
                To = BobAddress,
                Symbol = "ELF",
                Amount = 100000000_00000000
            });
            
            await AliceTokenContractStub.Approve.SendAsync(new ApproveInput
            {
                Spender = LotteryContractAddress,
                Symbol = "ELF",
                Amount = 100000000_00000000
            });
            
            await BobTokenContractStub.Approve.SendAsync(new ApproveInput
            {
                Spender = LotteryContractAddress,
                Symbol = "ELF",
                Amount = 100000000_00000000
            });
            
            return initializeInput;
        }
        [Fact]
        public async Task Initialize_And_CheckStatus_Test()
        {
            var initializeInput = await InitializeAsync();

            var currentPeriod = await LotteryContractStub.GetCurrentPeriod.CallAsync(new Empty());
            currentPeriod.PeriodNumber.ShouldBe(1);
            currentPeriod.RandomHash.ShouldBe(Hash.Empty);
            
            var periodNumber = await LotteryContractStub.GetCurrentPeriodNumber.CallAsync(new Empty());
            periodNumber.Value.ShouldBe(1);

            var period = await LotteryContractStub.GetPeriod.CallAsync(new Int64Value
            {
                Value = periodNumber.Value
            });
            
            period.ShouldBe(currentPeriod);

            var output = await LotteryContractStub.GetPeriods.CallAsync(new GetPeriodsInput
            {
                StartPeriodNumber = 1,
                Limit = 50
            });
            output.Periods.Count.ShouldBe(1);
            output.Periods[0].ShouldBe(currentPeriod);

            var admin = await LotteryContractStub.GetAdmin.CallAsync(new Empty());
            admin.ShouldBe(SampleAccount.Accounts[0].Address);

            var priceValue = await LotteryContractStub.GetPrice.CallAsync(new Empty());
            priceValue.Value.ShouldBe(initializeInput.Price);

            var rateDecimals = 4;
            
            var bonusRate = await LotteryContractStub.GetBonusRate.CallAsync(new Empty());
            bonusRate.Decimals.ShouldBe(rateDecimals);
            bonusRate.Rate.ShouldBe(initializeInput.BonusRate);
            
            var cashDuration = await LotteryContractStub.GetCashDuration.CallAsync(new Empty());
            cashDuration.Value.ShouldBe(initializeInput.CashDuration);
            
            var symbol = await LotteryContractStub.GetTokenSymbol.CallAsync(new Empty());
            symbol.Value.ShouldBe(initializeInput.TokenSymbol);
            
        }
        
        [Fact]
        public async Task Buy_And_TakeReward_Test()
        {
            await InitializeAsync();
            
            var output = await LotteryContractStub.GetLottery.CallAsync(new GetLotteryInput
            {
                LotteryId = 1
            });
            output.ShouldBe(new GetLotteryOutput());
            
            var seller = Address.FromPublicKey(SampleAccount.Accounts[2].KeyPair.PublicKey);
            await AliceLotteryContractStub.Buy.SendAsync(new BuyInput
            {
                Seller = seller,
                Type = (int) LotteryType.OneBit,
                BetInfos =
                {
                    new BetBody
                    {
                        Bets = {0}
                    }
                }
            });
            for (var i = 0; i < 20; i++)
            {
                await AliceLotteryContractStub.Buy.SendAsync(new BuyInput
                {
                    Seller = seller,
                    Type = (int) LotteryType.OneBit,
                    BetInfos =
                    {
                        new BetBody
                        {
                            Bets = {1}
                        }
                    }
                });
            }
            output = await AliceLotteryContractStub.GetLottery.CallAsync(new GetLotteryInput
            {
                LotteryId = 1
            });
            output.Lottery.ShouldNotBeNull();

            await LotteryContractStub.PrepareDraw.SendAsync(new Empty());

            var period = await LotteryContractStub.GetLatestDrawPeriod.CallAsync(new Empty());
            period.ShouldBe(new PeriodDetail());

            await LotteryContractStub.Draw.SendAsync(new Int64Value
            {
                Value = 1
            });
            
            period = await LotteryContractStub.GetLatestDrawPeriod.CallAsync(new Empty());
            period.ShouldNotBeNull();

            var getRewardedLotteriesOutput = await AliceLotteryContractStub.GetRewardedLotteries.CallAsync(new GetLotteriesInput
            {
                Offset = 0,
                Limit = 50
            });
            getRewardedLotteriesOutput.Lotteries.Count.ShouldBe(1);

            await AliceLotteryContractStub.TakeReward.SendAsync(new TakeRewardInput
            {
                LotteryId = output.Lottery.Id
            });
            
            getRewardedLotteriesOutput = await AliceLotteryContractStub.GetRewardedLotteries.CallAsync(new GetLotteriesInput
            {
                Offset = 0,
                Limit = 50
            });
            getRewardedLotteriesOutput.Lotteries.Count.ShouldBe(0);
            
            var lotteriesOutput = await AliceLotteryContractStub.GetLotteries.CallAsync(new GetLotteriesInput
            {
                Offset = 0,
                Limit = 50
            });
            lotteriesOutput.Lotteries.Count.ShouldBe(21);
        }

        [Fact]
        public async Task SetBonusRate_Test()
        {
            await InitializeAsync();
            var bonusRate = 200;
            var decimals = 4;
            await LotteryContractStub.SetBonusRate.SendAsync(new Int32Value
            {
                Value = bonusRate
            });
            var output = await LotteryContractStub.GetBonusRate.CallAsync(new Empty());
            output.Rate.ShouldBe(bonusRate);
            output.Decimals.ShouldBe(decimals);
        }

        [Fact]
        public async Task SetAdmin_Test()
        {
            await InitializeAsync();
            await LotteryContractStub.SetAdmin.SendAsync(AliceAddress);
            var admin = await LotteryContractStub.GetAdmin.CallAsync(new Empty());
            admin.ShouldBe(AliceAddress);
        }

        [Fact]
        public async Task GetRewards_Test()
        {
            await InitializeAsync();
            var output = await LotteryContractStub.GetRewards.CallAsync(new Empty());
            output.Rewards.Count.ShouldBe(5);
            foreach (var reward in output.Rewards)
            {
                switch (reward.Type)
                {
                      case LotteryType.Simple:
                          reward.Amount.ShouldBe(400_000_000);
                          break;
                      case LotteryType.OneBit:
                          reward.Amount.ShouldBe(1_000_000_000);
                          break;
                      case LotteryType.TwoBit:
                          reward.Amount.ShouldBe(10_000_000_000);
                          break;
                      case LotteryType.ThreeBit:
                          reward.Amount.ShouldBe(100_000_000_000);
                          break;
                      case LotteryType.FiveBit:
                          reward.Amount.ShouldBe(10_000_000_000_000);
                          break;
                      default:
                          throw new Exception("Invalid lottery type");
                }
            }
        }
    }
}