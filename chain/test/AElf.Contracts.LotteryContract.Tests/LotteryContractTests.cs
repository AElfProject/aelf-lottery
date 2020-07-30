using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AElf.Contracts.MultiToken;
using AElf.ContractTestBase.ContractTestKit;
using AElf.CSharp.Core.Extension;
using AElf.Kernel.Blockchain.Application;
using AElf.Types;
using Google.Protobuf.Collections;
using Google.Protobuf.WellKnownTypes;
using Microsoft.Extensions.DependencyInjection;
using Shouldly;
using Xunit;

namespace AElf.Contracts.LotteryContract
{
    public class LotteryContractTests : LotteryContractTestBase
    {
        private const long Price = 100_000_000;

        private TokenContractContainer.TokenContractStub AliceTokenContractStub => GetTokenContractStub(AliceKeyPair);

        private LotteryContractContainer.LotteryContractStub BobLotteryContractStub =>
            GetLotteryContractStub(BobKeyPair);

        private TokenContractContainer.TokenContractStub BobTokenContractStub => GetTokenContractStub(BobKeyPair);
        
        private readonly IBlockchainService _blockchainService;

        public LotteryContractTests()
        {
            _blockchainService = Application.ServiceProvider.GetRequiredService<IBlockchainService>();
        }

        private async Task<InitializeInput> InitializeAsync(bool needTransferToken = false)
        {
            var initializeInput = new InitializeInput
            {
                TokenSymbol = "ELF",
                Price = Price,
                BonusRate = 100,
                CashDuration = 60
            };
            await LotteryContractStub.Initialize.SendAsync(initializeInput);
            
            if (!needTransferToken) return initializeInput;
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
        public async Task Initialize_Success()
        {
            var initializeInput = await InitializeAsync();

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
        public async Task Initialize_Invalid_Input()
        {
            {
                var initializeInput = new InitializeInput
                {
                    TokenSymbol = "ELF",
                    Price = -1,
                    BonusRate = 100,
                    CashDuration = 60
                };
                var executionResult = await LotteryContractStub.Initialize.SendWithExceptionAsync(initializeInput);
                executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
                executionResult.TransactionResult.Error.ShouldContain("Invalid input");
            }
            
            {
                var initializeInput = new InitializeInput
                {
                    TokenSymbol = "ELF",
                    Price = Price,
                    BonusRate = 100,
                    CashDuration = -1
                };
                var executionResult = await LotteryContractStub.Initialize.SendWithExceptionAsync(initializeInput);
                executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
                executionResult.TransactionResult.Error.ShouldContain("Invalid input"); 
            }
            
        }

        [Fact]
        public async Task Initialize_Already_Initialized()
        {
            await InitializeAsync();
            var initializeInput = new InitializeInput
            {
                TokenSymbol = "ELF",
                Price = Price,
                BonusRate = 100,
                CashDuration = 60
            };
            var executionResult = await LotteryContractStub.Initialize.SendWithExceptionAsync(initializeInput);
            executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
            executionResult.TransactionResult.Error.ShouldContain("Already initialized");
        }
        
        [Fact]
        public async Task Initialize_No_Permission()
        {
            var initializeInput = new InitializeInput
            {
                TokenSymbol = "ELF",
                Price = Price,
                BonusRate = 100,
                CashDuration = 60
            };
            var executionResult = await AliceLotteryContractStub.Initialize.SendWithExceptionAsync(initializeInput);
            executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
            executionResult.TransactionResult.Error.ShouldContain("No permission");
        }

        [Fact]
        public async Task Initialize_Invalid_Token_Symbol()
        {
            var initializeInput = new InitializeInput
            {
                TokenSymbol = "NOTEXIST",
                Price = Price,
                BonusRate = 100,
                CashDuration = 60
            };
            var executionResult = await LotteryContractStub.Initialize.SendWithExceptionAsync(initializeInput);
            executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
            executionResult.TransactionResult.Error.ShouldContain("Invalid token symbol");
        }

        [Fact]
        public async Task Initialize_Invalid_Bonus_Rate()
        {
            var initializeInput = new InitializeInput
            {
                TokenSymbol = "ELF",
                Price = Price,
                BonusRate = -1,
                CashDuration = 60
            };
            var executionResult = await LotteryContractStub.Initialize.SendWithExceptionAsync(initializeInput);
            executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
            executionResult.TransactionResult.Error.ShouldContain("Invalid bonus rate");
            
            initializeInput = new InitializeInput
            {
                TokenSymbol = "ELF",
                Price = Price,
                BonusRate = 11000,
                CashDuration = 60
            };
            executionResult = await LotteryContractStub.Initialize.SendWithExceptionAsync(initializeInput);
            executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
            executionResult.TransactionResult.Error.ShouldContain("Invalid bonus rate");
        }
        
        [Fact]
        public async Task Buy_And_TakeReward_Test()
        {
            await InitializeAsync(true);
            
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
            var latestCashedLottery = await BobLotteryContractStub.GetLatestCashedLottery.CallAsync(new Empty());
            latestCashedLottery.Address.ShouldBe(AliceAddress);
            latestCashedLottery.Type.ShouldBe((int) LotteryType.OneBit);
            latestCashedLottery.PeriodNumber.ShouldBe(1);
            latestCashedLottery.StartPeriodNumberOfDay.ShouldBe(1);
            
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
        public async Task Buy_Success()
        {
            await InitializeAsync(true);
            var balanceOutput = await TokenContractStub.GetBalance.CallAsync(new GetBalanceInput
            {
                Symbol = "ELF",
                Owner = AliceAddress
            });
            var beforeBalance = balanceOutput.Balance;
            var seller = SampleAccount.Accounts[2].Address;
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
            var lotteryDetail = await AliceLotteryContractStub.GetLottery.CallAsync(new GetLotteryInput
            {
                LotteryId = 1
            });
            var amount = lotteryDetail.Lottery.Price;
            var bonusRateOutput = await AliceLotteryContractStub.GetBonusRate.CallAsync(new Empty());
            balanceOutput = await TokenContractStub.GetBalance.CallAsync(new GetBalanceInput
            {
                Symbol = "ELF",
                Owner = seller
            });
            balanceOutput.Balance.ShouldBe(amount * bonusRateOutput.Rate / (int) Math.Pow(10, bonusRateOutput.Decimals));
            
            balanceOutput = await TokenContractStub.GetBalance.CallAsync(new GetBalanceInput
            {
                Symbol = "ELF",
                Owner = LotteryContractAddress
            });
            balanceOutput.Balance.ShouldBe(amount - amount * bonusRateOutput.Rate /
                                           (int) Math.Pow(10, bonusRateOutput.Decimals));
            
            balanceOutput = await TokenContractStub.GetBalance.CallAsync(new GetBalanceInput
            {
                Symbol = "ELF",
                Owner = AliceAddress
            });
            balanceOutput.Balance.ShouldBe(beforeBalance - amount);
        }

        [Fact]
        public async Task Buy_Deal_With_Undone_Lotteries()
        {
            await InitializeAsync(true);
            var buyInput = new BuyInput
            {
                Seller = BobAddress,
                Type = (int) LotteryType.OneBit,
                BetInfos =
                {
                    new BetBody
                    {
                        Bets = {0}
                    }
                }
            };
            await AliceLotteryContractStub.Buy.SendAsync(buyInput);
            await AliceLotteryContractStub.Buy.SendAsync(buyInput);
            buyInput = new BuyInput
            {
                Seller = BobAddress,
                Type = (int) LotteryType.OneBit,
                BetInfos =
                {
                    new BetBody
                    {
                        Bets = {1}
                    }
                }
            };
            await AliceLotteryContractStub.Buy.SendAsync(buyInput);
            await LotteryContractStub.PrepareDraw.SendAsync(new Empty());
            await LotteryContractStub.Draw.SendAsync(new Int64Value
            {
                Value = 1
            });
            
            await AliceLotteryContractStub.Buy.SendAsync(buyInput);
            var lotteryOutput = await AliceLotteryContractStub.GetLottery.CallAsync(new GetLotteryInput
            {
                LotteryId = 1
            });
            lotteryOutput.Lottery.Reward.ShouldBe(await GetRewardAsync(lotteryOutput.Lottery.Type));
            
            lotteryOutput = await AliceLotteryContractStub.GetLottery.CallAsync(new GetLotteryInput
            {
                LotteryId = 3
            });
            lotteryOutput.Lottery.Cashed.ShouldBeTrue();
            lotteryOutput.Lottery.Reward.ShouldBe(0);
        }

        [Fact]
        public async Task Buy_Invalid_Lottery_Type()
        {
            await InitializeAsync(true);
            var invalidLotteryType = -1;
            var executionResult = await LotteryContractStub.Buy.SendWithExceptionAsync(new BuyInput
            {
                Seller = BobAddress,
                Type = invalidLotteryType,
                BetInfos =
                {
                    new BetBody
                    {
                        Bets = {0}
                    }
                }
            });
            executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
            executionResult.TransactionResult.Error.ShouldContain("Invalid lottery type");
        }
        
        [Fact]
        public async Task Buy_Insufficient_Allowance()
        {
            await InitializeAsync();
            var bets = new [] {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
            var executionResult = await AliceLotteryContractStub.Buy.SendWithExceptionAsync(new BuyInput
            {
                Seller = BobAddress,
                Type = (int) LotteryType.OneBit,
                BetInfos =
                {
                    new BetBody
                    {
                        Bets = {bets}
                    }
                }
            });
            executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
            executionResult.TransactionResult.Error.ShouldContain("Insufficient allowance");
        }
        
        [Fact]
        public async Task Buy_Simple_Invalid_Bet_Info()
        {
            await InitializeAsync(true);
            //Invalid count(greater than 2)
            {
                var executionResult = await LotteryContractStub.Buy.SendWithExceptionAsync(new BuyInput
                {
                    Seller = BobAddress,
                    Type = (int) LotteryType.Simple,
                    BetInfos =
                    {
                        GetBetInfos(3)
                    }
                });
                executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
                executionResult.TransactionResult.Error.ShouldContain("Invalid bet info");
            }
            //Same number
            {
                var executionResult = await LotteryContractStub.Buy.SendWithExceptionAsync(new BuyInput
                {
                    Seller = BobAddress,
                    Type = (int) LotteryType.Simple,
                    BetInfos =
                    {
                        GetBetInfosWithSameNumber(2)
                    }
                });
                executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
                executionResult.TransactionResult.Error.ShouldContain("Invalid bet info");
            }
            //less than 0
            {
                var executionResult = await LotteryContractStub.Buy.SendWithExceptionAsync(new BuyInput
                {
                    Seller = BobAddress,
                    Type = (int) LotteryType.Simple,
                    BetInfos =
                    {
                        GetBetInfosWithNegativeNumber(2)
                    }
                });
                executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
                executionResult.TransactionResult.Error.ShouldContain("Invalid bet info");
            }
            //greater than 3
            {
                var executionResult = await LotteryContractStub.Buy.SendWithExceptionAsync(new BuyInput
                {
                    Seller = BobAddress,
                    Type = (int) LotteryType.Simple,
                    BetInfos =
                    {
                        GetBetInfosWitLargerNumber(2, 4)
                    }
                });
                executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
                executionResult.TransactionResult.Error.ShouldContain("Invalid bet info");
            }
        }

        [Fact]
        public async Task Buy_OneBit_Invalid_Bet_Info()
        {
            await InitializeAsync(true);
            //Invalid count(greater than 1)
            {
                var executionResult = await LotteryContractStub.Buy.SendWithExceptionAsync(new BuyInput
                {
                    Seller = BobAddress,
                    Type = (int) LotteryType.OneBit,
                    BetInfos =
                    {
                        GetBetInfos(2)
                    }
                });
                executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
                executionResult.TransactionResult.Error.ShouldContain("Invalid bet info");
            }
            //Same number
            {
                var executionResult = await LotteryContractStub.Buy.SendWithExceptionAsync(new BuyInput
                {
                    Seller = BobAddress,
                    Type = (int) LotteryType.OneBit,
                    BetInfos =
                    {
                        GetBetInfosWithSameNumber(1)
                    }
                });
                executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
                executionResult.TransactionResult.Error.ShouldContain("Invalid bet info");
            }
            //less than 0
            {
                var executionResult = await LotteryContractStub.Buy.SendWithExceptionAsync(new BuyInput
                {
                    Seller = BobAddress,
                    Type = (int) LotteryType.OneBit,
                    BetInfos =
                    {
                        GetBetInfosWithNegativeNumber(1)
                    }
                });
                executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
                executionResult.TransactionResult.Error.ShouldContain("Invalid bet info");
            }
            //greater than 9
            {
                var executionResult = await LotteryContractStub.Buy.SendWithExceptionAsync(new BuyInput
                {
                    Seller = BobAddress,
                    Type = (int) LotteryType.OneBit,
                    BetInfos =
                    {
                        GetBetInfosWitLargerNumber(1)
                    }
                });
                executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
                executionResult.TransactionResult.Error.ShouldContain("Invalid bet info");
            }
        }
        
        [Fact]
        public async Task Buy_TwoBit_Invalid_Bet_Info()
        {
            await InitializeAsync(true);
            //Invalid count(greater than 2)
            {
                var executionResult = await LotteryContractStub.Buy.SendWithExceptionAsync(new BuyInput
                {
                    Seller = BobAddress,
                    Type = (int) LotteryType.TwoBit,
                    BetInfos =
                    {
                        GetBetInfos(3)
                    }
                });
                executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
                executionResult.TransactionResult.Error.ShouldContain("Invalid bet info");
            }
            //Same number
            {
                var executionResult = await LotteryContractStub.Buy.SendWithExceptionAsync(new BuyInput
                {
                    Seller = BobAddress,
                    Type = (int) LotteryType.TwoBit,
                    BetInfos =
                    {
                        GetBetInfosWithSameNumber(2)
                    }
                });
                executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
                executionResult.TransactionResult.Error.ShouldContain("Invalid bet info");
            }
            //less than 0
            {
                var executionResult = await LotteryContractStub.Buy.SendWithExceptionAsync(new BuyInput
                {
                    Seller = BobAddress,
                    Type = (int) LotteryType.TwoBit,
                    BetInfos =
                    {
                        GetBetInfosWithNegativeNumber(2)
                    }
                });
                executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
                executionResult.TransactionResult.Error.ShouldContain("Invalid bet info");
            }
            //greater than 9
            {
                var executionResult = await LotteryContractStub.Buy.SendWithExceptionAsync(new BuyInput
                {
                    Seller = BobAddress,
                    Type = (int) LotteryType.TwoBit,
                    BetInfos =
                    {
                        GetBetInfosWitLargerNumber(2)
                    }
                });
                executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
                executionResult.TransactionResult.Error.ShouldContain("Invalid bet info");
            }
        }
        
        [Fact]
        public async Task Buy_ThreeBit_Invalid_Bet_Info()
        {
            await InitializeAsync(true);
            //Invalid count(greater than 3)
            {
                var executionResult = await LotteryContractStub.Buy.SendWithExceptionAsync(new BuyInput
                {
                    Seller = BobAddress,
                    Type = (int) LotteryType.ThreeBit,
                    BetInfos =
                    {
                        GetBetInfos(4)
                    }
                });
                executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
                executionResult.TransactionResult.Error.ShouldContain("Invalid bet info");
            }
            //Same number
            {
                var executionResult = await LotteryContractStub.Buy.SendWithExceptionAsync(new BuyInput
                {
                    Seller = BobAddress,
                    Type = (int) LotteryType.ThreeBit,
                    BetInfos =
                    {
                        GetBetInfosWithSameNumber(3)
                    }
                });
                executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
                executionResult.TransactionResult.Error.ShouldContain("Invalid bet info");
            }
            //less than 0
            {
                var executionResult = await LotteryContractStub.Buy.SendWithExceptionAsync(new BuyInput
                {
                    Seller = BobAddress,
                    Type = (int) LotteryType.ThreeBit,
                    BetInfos =
                    {
                        GetBetInfosWithNegativeNumber(3)
                    }
                });
                executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
                executionResult.TransactionResult.Error.ShouldContain("Invalid bet info");
            }
            //greater than 9
            {
                var executionResult = await LotteryContractStub.Buy.SendWithExceptionAsync(new BuyInput
                {
                    Seller = BobAddress,
                    Type = (int) LotteryType.ThreeBit,
                    BetInfos =
                    {
                        GetBetInfosWitLargerNumber(3)
                    }
                });
                executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
                executionResult.TransactionResult.Error.ShouldContain("Invalid bet info");
            }
        }
        
        [Fact]
        public async Task Buy_FiveBit_Invalid_Bet_Info()
        {
            await InitializeAsync(true);
            //Invalid count(greater than 5)
            {
                var executionResult = await LotteryContractStub.Buy.SendWithExceptionAsync(new BuyInput
                {
                    Seller = BobAddress,
                    Type = (int) LotteryType.FiveBit,
                    BetInfos =
                    {
                        GetBetInfos()
                    }
                });
                executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
                executionResult.TransactionResult.Error.ShouldContain("Invalid bet info");
            }
            //Same number
            {
                var executionResult = await LotteryContractStub.Buy.SendWithExceptionAsync(new BuyInput
                {
                    Seller = BobAddress,
                    Type = (int) LotteryType.FiveBit,
                    BetInfos =
                    {
                        GetBetInfosWithSameNumber()
                    }
                });
                executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
                executionResult.TransactionResult.Error.ShouldContain("Invalid bet info");
            }
            //less than 0
            {
                var executionResult = await LotteryContractStub.Buy.SendWithExceptionAsync(new BuyInput
                {
                    Seller = BobAddress,
                    Type = (int) LotteryType.FiveBit,
                    BetInfos =
                    {
                        GetBetInfosWithNegativeNumber()
                    }
                });
                executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
                executionResult.TransactionResult.Error.ShouldContain("Invalid bet info");
            }
            //greater than 9
            {
                var executionResult = await LotteryContractStub.Buy.SendWithExceptionAsync(new BuyInput
                {
                    Seller = BobAddress,
                    Type = (int) LotteryType.FiveBit,
                    BetInfos =
                    {
                        GetBetInfosWitLargerNumber()
                    }
                });
                executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
                executionResult.TransactionResult.Error.ShouldContain("Invalid bet info");
            }
        }

        [Fact]
        public async Task TakeReward_Success()
        {
            await InitializeAsync(true);
            await TokenContractStub.Transfer.SendAsync(new TransferInput
            {
                Amount = 1000_000_000_000,
                Symbol = "ELF",
                To = LotteryContractAddress
            });
            var buyInput = new BuyInput
            {
                Seller = BobAddress,
                Type = (int) LotteryType.OneBit,
                BetInfos =
                {
                    new BetBody
                    {
                        Bets = {0}
                    }
                }
            };
            await AliceLotteryContractStub.Buy.SendAsync(buyInput);
            await LotteryContractStub.PrepareDraw.SendAsync(new Empty());
            await LotteryContractStub.Draw.SendAsync(new Int64Value
            {
                Value = 1
            });
            var balanceOutput = await TokenContractStub.GetBalance.CallAsync(new GetBalanceInput
            {
                Owner = AliceAddress,
                Symbol = "ELF"
            });
            var beforeBalance = balanceOutput.Balance;
            await AliceLotteryContractStub.TakeReward.SendAsync(new TakeRewardInput
            {
                LotteryId = 1
            });
            balanceOutput = await TokenContractStub.GetBalance.CallAsync(new GetBalanceInput
            {
                Owner = AliceAddress,
                Symbol = "ELF"
            });
            var rewardsOutput = await LotteryContractStub.GetRewards.CallAsync(new Empty());
            balanceOutput.Balance.ShouldBe(beforeBalance +
                                           rewardsOutput.Rewards.Single(r => r.Type == buyInput.Type).Amount);
        }
        
        [Fact]
        public async Task TakeReward_Deal_With_Undone_Lotteries()
        {
            await InitializeAsync(true);
            await TokenContractStub.Transfer.SendAsync(new TransferInput
            {
                Amount = 1000_000_000_000,
                Symbol = "ELF",
                To = LotteryContractAddress
            });
            var buyInput = new BuyInput
            {
                Seller = BobAddress,
                Type = (int) LotteryType.OneBit,
                BetInfos =
                {
                    new BetBody
                    {
                        Bets = {0}
                    }
                }
            };
            await AliceLotteryContractStub.Buy.SendAsync(buyInput);
            await AliceLotteryContractStub.Buy.SendAsync(buyInput);
            buyInput = new BuyInput
            {
                Seller = BobAddress,
                Type = (int) LotteryType.OneBit,
                BetInfos =
                {
                    new BetBody
                    {
                        Bets = {1}
                    }
                }
            };
            await AliceLotteryContractStub.Buy.SendAsync(buyInput);
            await LotteryContractStub.PrepareDraw.SendAsync(new Empty());
            await LotteryContractStub.Draw.SendAsync(new Int64Value
            {
                Value = 1
            });
            
            await AliceLotteryContractStub.TakeReward.SendAsync(new TakeRewardInput
            {
                LotteryId = 1
            });
            
            var lotteryOutput = await AliceLotteryContractStub.GetLottery.CallAsync(new GetLotteryInput
            {
                LotteryId = 3
            });
            lotteryOutput.Lottery.Cashed.ShouldBeTrue();
            lotteryOutput.Lottery.Reward.ShouldBe(0);
        }

        [Fact]
        public async Task TakeReward_Lottery_Not_Found()
        {
            await InitializeAsync();
            var executionResult = await LotteryContractStub.TakeReward.SendWithExceptionAsync(new TakeRewardInput
            {
                LotteryId = 1
            });
            executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
            executionResult.TransactionResult.Error.ShouldContain("Lottery not found");
        }
        
        [Fact]
        public async Task TakeReward_Take_Wrong_Lottery()
        {
            await InitializeAsync(true);
            await AliceLotteryContractStub.Buy.SendAsync(new BuyInput
            {
                Seller = BobAddress,
                Type = (int) LotteryType.OneBit,
                BetInfos =
                {
                    new BetBody
                    {
                        Bets = {0}
                    }
                }
            });
            var executionResult = await LotteryContractStub.TakeReward.SendWithExceptionAsync(new TakeRewardInput
            {
                LotteryId = 1
            });
            executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
            executionResult.TransactionResult.Error.ShouldContain("Cannot take reward for other people's lottery");
        }
        
        [Fact]
        public async Task TakeReward_Lottery_Has_Been_Cashed()
        {
            await InitializeAsync(true);
            await TokenContractStub.Transfer.SendAsync(new TransferInput
            {
                Amount = 1000_000_000_000,
                Symbol = "ELF",
                To = LotteryContractAddress
            });
            await AliceLotteryContractStub.Buy.SendAsync(new BuyInput
            {
                Seller = BobAddress,
                Type = (int) LotteryType.OneBit,
                BetInfos =
                {
                    new BetBody
                    {
                        Bets = {0}
                    }
                }
            });
            await LotteryContractStub.PrepareDraw.SendAsync(new Empty());
            await LotteryContractStub.Draw.SendAsync(new Int64Value
            {
                Value = 1
            });
            await AliceLotteryContractStub.TakeReward.SendAsync(new TakeRewardInput
            {
                LotteryId = 1
            });
            var executionResult = await AliceLotteryContractStub.TakeReward.SendWithExceptionAsync(new TakeRewardInput
            {
                LotteryId = 1
            });
            executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
            executionResult.TransactionResult.Error.ShouldContain("Lottery has been cashed");
        }
        
        [Fact]
        public async Task TakeReward_Period_Not_Drew()
        {
            await InitializeAsync(true);
            await AliceLotteryContractStub.Buy.SendAsync(new BuyInput
            {
                Seller = BobAddress,
                Type = (int) LotteryType.OneBit,
                BetInfos =
                {
                    new BetBody
                    {
                        Bets = {0}
                    }
                }
            });
            var executionResult = await AliceLotteryContractStub.TakeReward.SendWithExceptionAsync(new TakeRewardInput
            {
                LotteryId = 1
            });
            executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
            executionResult.TransactionResult.Error.ShouldContain("Period 1 hasn't drew");
        }

        [Fact]
        public async Task TakeReward_Expired()
        {
            await InitializeAsync(true);
            await AliceLotteryContractStub.Buy.SendAsync(new BuyInput
            {
                Seller = BobAddress,
                Type = (int) LotteryType.OneBit,
                BetInfos =
                {
                    new BetBody
                    {
                        Bets = {0}
                    }
                }
            });
            await LotteryContractStub.PrepareDraw.SendAsync(new Empty());
            await LotteryContractStub.Draw.SendAsync(new Int64Value
            {
                Value = 1
            });
            BlockTimeProvider.SetBlockTime(BlockTimeProvider.GetBlockTime().AddDays(61));
            var executionResult = await AliceLotteryContractStub.TakeReward.SendWithExceptionAsync(new TakeRewardInput
            {
                LotteryId = 1
            });
            executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
            executionResult.TransactionResult.Error.ShouldContain("Cannot cash expired lottery");
        }
        
        [Fact]
        public async Task Draw_Test()
        {
            await InitializeAsync(true);
            var currentPeriodNumber = await LotteryContractStub.GetCurrentPeriodNumber.CallAsync(new Empty());
            var executionResult = await LotteryContractStub.Draw.SendWithExceptionAsync(currentPeriodNumber);
            executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
            executionResult.TransactionResult.Error.ShouldContain("Incorrect period");
            
            executionResult = await LotteryContractStub.Draw.SendWithExceptionAsync(new Int64Value {Value = currentPeriodNumber.Value - 1});
            executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
            executionResult.TransactionResult.Error.ShouldContain("Not ready to draw");

            await LotteryContractStub.PrepareDraw.SendAsync(new Empty());
            executionResult = await AliceLotteryContractStub.Draw.SendWithExceptionAsync(currentPeriodNumber);
            executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
            executionResult.TransactionResult.Error.ShouldContain("No permission to draw!");
            
            await LotteryContractStub.Draw.SendAsync(currentPeriodNumber);
            
            executionResult = await LotteryContractStub.Draw.SendWithExceptionAsync(currentPeriodNumber);
            executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
            executionResult.TransactionResult.Error.ShouldContain("Latest period already drawn");
        }
        
        [Fact]
        public async Task PrepareDraw_Success()
        {
            await InitializeAsync(true);
            var currentPeriodNumber = await LotteryContractStub.GetCurrentPeriodNumber.CallAsync(new Empty());
            currentPeriodNumber.Value.ShouldBe(1);
            await LotteryContractStub.PrepareDraw.SendAsync(new Empty());
            currentPeriodNumber = await LotteryContractStub.GetCurrentPeriodNumber.CallAsync(new Empty());
            currentPeriodNumber.Value.ShouldBe(2);
        }

        [Fact]
        public async Task PrepareDraw_No_Permission()
        {
            await InitializeAsync(true);
            var executionResult = await AliceLotteryContractStub.PrepareDraw.SendWithExceptionAsync(new Empty());
            executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
            executionResult.TransactionResult.Error.ShouldContain("No permission to prepare!");
        }
        
        [Fact]
        public async Task PrepareDraw_Previous_Period_Not_drew()
        {
            await InitializeAsync(true);
            await LotteryContractStub.PrepareDraw.SendAsync(new Empty());
            var executionResult = await LotteryContractStub.PrepareDraw.SendWithExceptionAsync(new Empty());
            executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
            executionResult.TransactionResult.Error.ShouldContain("Period 1 hasn't drew");
        }

        [Fact]
        public async Task SetBonusRate_Success()
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
        public async Task SetBonusRate_Invalid_Bonus_Rate()
        {
            await InitializeAsync();
            var executionResult = await LotteryContractStub.SetBonusRate.SendWithExceptionAsync(new Int32Value
            {
                Value = -1
            });
            executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
            executionResult.TransactionResult.Error.ShouldContain("Invalid bonus rate");
            
            executionResult = await LotteryContractStub.SetBonusRate.SendWithExceptionAsync(new Int32Value
            {
                Value = 11000
            });
            executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
            executionResult.TransactionResult.Error.ShouldContain("Invalid bonus rate");
            
        }
        
        [Fact]
        public async Task SetBonusRate_No_Permission()
        {
            await InitializeAsync();
            var executionResult = await AliceLotteryContractStub.SetBonusRate.SendWithExceptionAsync(new Int32Value
            {
                Value = 200
            });
            executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
            executionResult.TransactionResult.Error.ShouldContain("No permission");
        }

        [Fact]
        public async Task SetAdmin_Success()
        {
            await InitializeAsync();
            await LotteryContractStub.SetAdmin.SendAsync(AliceAddress);
            var admin = await LotteryContractStub.GetAdmin.CallAsync(new Empty());
            admin.ShouldBe(AliceAddress);
        }
        
        [Fact]
        public async Task SetAdmin_No_Permission()
        {
            await InitializeAsync();
            var executionResult = await AliceLotteryContractStub.SetAdmin.SendWithExceptionAsync(AliceAddress);
            executionResult.TransactionResult.Status.ShouldBe(TransactionResultStatus.Failed);
            executionResult.TransactionResult.Error.ShouldContain("No permission");
        }

        [Fact]
        public async Task GetLottery_Success()
        {
            await InitializeAsync(true);
            await TokenContractStub.Transfer.SendAsync(new TransferInput
            {
                Amount = 1000_000_000_000,
                Symbol = "ELF",
                To = LotteryContractAddress
            });
            var buyInput = new BuyInput
            {
                Seller = BobAddress,
                Type = (int)LotteryType.OneBit,
                BetInfos =
                {
                    new BetBody
                    {
                        Bets = {0}
                    }
                }
            };
            await AliceLotteryContractStub.Buy.SendAsync(buyInput);
            
            var blockHeader = await _blockchainService.GetBestChainLastBlockHeaderAsync();
            
            await AliceLotteryContractStub.Buy.SendAsync(new BuyInput
            {
                Seller = BobAddress,
                Type = (int) LotteryType.OneBit,
                BetInfos =
                {
                    new BetBody
                    {
                        Bets = {1}
                    }
                }
            });
            var getLotteryInput = new GetLotteryInput
            {
                LotteryId = 1
            };
            var lotteryOutput = await AliceLotteryContractStub.GetLottery.CallAsync(getLotteryInput);
            
            var lottery = lotteryOutput.Lottery;
            lottery.Cashed.ShouldBeFalse();
            lottery.Expired.ShouldBeFalse();
            lottery.Price.ShouldBe(Price);
            lottery.Reward.ShouldBe(0);
            lottery.Type.ShouldBe(buyInput.Type);
            lottery.BetInfos.ShouldBe(buyInput.BetInfos);
            lottery.PeriodNumber.ShouldBe(1);
            lottery.StartPeriodNumberOfDay.ShouldBe(1);
            lottery.BlockNumber.ShouldBe(blockHeader.Height);
            lottery.CreateTime.ShouldBe(blockHeader.Time);

            await LotteryContractStub.PrepareDraw.SendAsync(new Empty());
            await LotteryContractStub.Draw.SendAsync(new Int64Value
            {
                Value = 1
            });
            lotteryOutput = await AliceLotteryContractStub.GetLottery.CallAsync(getLotteryInput);
            lottery = lotteryOutput.Lottery;
            var reward = await GetRewardAsync(lottery.Type);
            lottery.Reward.ShouldBe(reward);

            await AliceLotteryContractStub.TakeReward.SendAsync(new TakeRewardInput
            {
                LotteryId = 1
            });
            
            lotteryOutput = await AliceLotteryContractStub.GetLottery.CallAsync(getLotteryInput);
            lottery = lotteryOutput.Lottery;
            lottery.Cashed.ShouldBeTrue();
            lottery.Reward.ShouldBe(reward);

            getLotteryInput.LotteryId = 2;
            lotteryOutput = await AliceLotteryContractStub.GetLottery.CallAsync(getLotteryInput);
            var lotteryWithoutReward = lotteryOutput.Lottery;
            lotteryWithoutReward.Cashed.ShouldBeTrue();
            lotteryWithoutReward.Reward.ShouldBe(0);

            var lotteriesOutput = await AliceLotteryContractStub.GetLotteries.CallAsync(new GetLotteriesInput
            {
                Offset = 0,
                Limit = 10
            });
            lotteriesOutput.Lotteries.Count.ShouldBe(2);
            lotteriesOutput.Lotteries[0].ShouldBe(lotteryWithoutReward);
            lotteriesOutput.Lotteries[1].ShouldBe(lottery);
            
            lotteriesOutput = await AliceLotteryContractStub.GetLotteries.CallAsync(new GetLotteriesInput
            {
                Offset = 0,
                Limit = 1
            });
            lotteriesOutput.Lotteries.Count.ShouldBe(1);
            lotteriesOutput.Lotteries[0].ShouldBe(lotteryWithoutReward);
        }

        [Fact]
        public async Task GetLottery_Return_Null()
        {
            var lotteryOutput = await AliceLotteryContractStub.GetLottery.CallAsync(new GetLotteryInput
            {
                LotteryId = 1
            });
            lotteryOutput.Lottery.ShouldBeNull();
        }

        [Fact]
        public async Task GetLottery_Other_People_Lottery()
        {
            await InitializeAsync(true);
            await AliceLotteryContractStub.Buy.SendAsync(new BuyInput
            {
                Seller = BobAddress,
                Type = (int) LotteryType.OneBit,
                BetInfos =
                {
                    new BetBody
                    {
                        Bets = {0}
                    }
                }
            });
            var result = await LotteryContractStub.GetLottery.CallWithExceptionAsync(new GetLotteryInput
            {
                LotteryId = 1
            });
            result.Value.ShouldContain("Cannot query other people's lottery");
        }

        [Fact]
        public async Task GetLotteries_Invalid_Input()
        {
            var result = await LotteryContractStub.GetLotteries.CallWithExceptionAsync(new GetLotteriesInput
            {
                Offset = -1,
                Limit = 10
            });
            result.Value.ShouldContain("Invalid input");
            
            result = await LotteryContractStub.GetLotteries.CallWithExceptionAsync(new GetLotteriesInput
            {
                Offset = 0,
                Limit = 0
            });
            result.Value.ShouldContain("Invalid input");
        }

        [Fact]
        public async Task GetLotteries_Out_Of_Limit()
        {
            var result = await LotteryContractStub.GetLotteries.CallWithExceptionAsync(new GetLotteriesInput
            {
                Offset = 0,
                Limit = 51
            });
            result.Value.ShouldContain("Limit should be less than 50");
        }
        
        [Fact]
        public async Task GetRewardedLotteries_Invalid_Input()
        {
            var result = await LotteryContractStub.GetRewardedLotteries.CallWithExceptionAsync(new GetLotteriesInput
            {
                Offset = -1,
                Limit = 10
            });
            result.Value.ShouldContain("Invalid input");
            
            result = await LotteryContractStub.GetRewardedLotteries.CallWithExceptionAsync(new GetLotteriesInput
            {
                Offset = 0,
                Limit = 0
            });
            result.Value.ShouldContain("Invalid input");
        }
        
        [Fact]
        public async Task GetRewardedLotteries_Out_Of_Limit()
        {
            var result = await LotteryContractStub.GetRewardedLotteries.CallWithExceptionAsync(new GetLotteriesInput
            {
                Offset = 0,
                Limit = 51
            });
            result.Value.ShouldContain("Limit should be less than 50");
        }
        
        [Fact]
        public async Task GetPeriod_Without_Draw()
        {
            await InitializeAsync();
            
            var currentPeriod = await LotteryContractStub.GetCurrentPeriod.CallAsync(new Empty());
            currentPeriod.PeriodNumber.ShouldBe(1);
            currentPeriod.RandomHash.ShouldBe(Hash.Empty);
            currentPeriod.DrawTime.ShouldBeNull();
            currentPeriod.LuckyNumber.ShouldBe(0);
            currentPeriod.DrawBlockNumber.ShouldBe(0);
            currentPeriod.StartPeriodNumberOfDay.ShouldBe(1);
            
            var blockHeader = await _blockchainService.GetBestChainLastBlockHeaderAsync();
            currentPeriod.BlockNumber.ShouldBe(blockHeader.Height);
            currentPeriod.CreateTime.ShouldBe(blockHeader.Time);

            var period = await LotteryContractStub.GetPeriod.CallAsync(new Int64Value
            {
                Value = currentPeriod.PeriodNumber
            });
            period.ShouldBe(currentPeriod);
            
            var output = await LotteryContractStub.GetPeriods.CallAsync(new GetPeriodsInput
            {
                StartPeriodNumber = 1,
                Limit = 50
            });
            output.Periods.Count.ShouldBe(1);
            output.Periods[0].ShouldBe(currentPeriod);
        }
        
        [Fact]
        public async Task GetPeriod_With_Draw()
        {
            await InitializeAsync();
            var blockHeader = await _blockchainService.GetBestChainLastBlockHeaderAsync();
            await LotteryContractStub.PrepareDraw.SendAsync(new Empty());
            await LotteryContractStub.Draw.SendAsync(new Int64Value
            {
                Value = 1
            });
            
            var drawBlockHeader = await _blockchainService.GetBestChainLastBlockHeaderAsync();
            
            var period = await LotteryContractStub.GetPeriod.CallAsync(new Int64Value
            {
                Value = 1
            });
            period.PeriodNumber.ShouldBe(1);
            period.RandomHash.ShouldNotBeNull();
            period.DrawTime.ShouldBe(drawBlockHeader.Time);
            period.DrawBlockNumber.ShouldBe(drawBlockHeader.Height);
            period.StartPeriodNumberOfDay.ShouldBe(1);
            period.BlockNumber.ShouldBe(blockHeader.Height);
            period.CreateTime.ShouldBe(blockHeader.Time);
            
            var periodTwo = await LotteryContractStub.GetPeriod.CallAsync(new Int64Value
            {
                Value = 2
            });
            
            var output = await LotteryContractStub.GetPeriods.CallAsync(new GetPeriodsInput
            {
                StartPeriodNumber = 2,
                Limit = 1
            });
            output.Periods.Count.ShouldBe(1);
            output.Periods[0].ShouldBe(periodTwo);
            
            output = await LotteryContractStub.GetPeriods.CallAsync(new GetPeriodsInput
            {
                StartPeriodNumber = 2,
                Limit = 50
            });
            output.Periods.Count.ShouldBe(2);
            output.Periods[0].ShouldBe(periodTwo);
            output.Periods[1].ShouldBe(period);
        }
        
        [Fact]
        public async Task GetPeriod_Return_Null()
        {
            var currentPeriod = await LotteryContractStub.GetCurrentPeriod.CallAsync(new Empty());
            currentPeriod.CreateTime.ShouldBeNull();
            
            await InitializeAsync();

            var period = await LotteryContractStub.GetPeriod.CallAsync(new Int64Value
            {
                Value = 2
            });
            period.ShouldBe(currentPeriod);
        }

        [Fact]
        public async Task GetPeriods_Invalid_Input()
        {
            var result = await LotteryContractStub.GetPeriods.CallWithExceptionAsync(new GetPeriodsInput
            {
                StartPeriodNumber = 0,
                Limit = 10
            });
            result.Value.ShouldContain("Invalid input");
            
            result = await LotteryContractStub.GetPeriods.CallWithExceptionAsync(new GetPeriodsInput
            {
                StartPeriodNumber = 1,
                Limit = 0
            });
            result.Value.ShouldContain("Invalid input");
        }

        [Fact]
        public async Task GePeriods_Out_Of_Limit()
        {
            var result = await LotteryContractStub.GetPeriods.CallWithExceptionAsync(new GetPeriodsInput
            {
                StartPeriodNumber = 1,
                Limit = 51
            });
            result.Value.ShouldContain("Limit should be less than 50");
        }

        [Fact]
        public async Task GetLatestCashedLottery_Return_Default()
        {
            var output = await LotteryContractStub.GetLatestCashedLottery.CallAsync(new Empty());
            output.ShouldBe(new GetLatestCashedLotteryOutput());
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
                      case (int)LotteryType.Simple:
                          reward.Amount.ShouldBe(400_000_000);
                          break;
                      case (int)LotteryType.OneBit:
                          reward.Amount.ShouldBe(1_000_000_000);
                          break;
                      case (int)LotteryType.TwoBit:
                          reward.Amount.ShouldBe(10_000_000_000);
                          break;
                      case (int)LotteryType.ThreeBit:
                          reward.Amount.ShouldBe(100_000_000_000);
                          break;
                      case (int)LotteryType.FiveBit:
                          reward.Amount.ShouldBe(10_000_000_000_000);
                          break;
                      default:
                          throw new Exception("Invalid lottery type");
                }
            }
        }

        private IEnumerable<BetBody> GetBetInfos(int count = 6)
        {
            var betInfos = new RepeatedField<BetBody>
            {
                new BetBody
                {
                    Bets = {0}
                },
                new BetBody
                {
                    Bets = {1}
                },
                new BetBody
                {
                    Bets = {2}
                },
                new BetBody
                {
                    Bets = {3}
                },
                new BetBody
                {
                    Bets = {4}
                },
                new BetBody
                {
                    Bets = {5}
                }
            };
            return betInfos.Take(count);
        }
        private IEnumerable<BetBody> GetBetInfosWithSameNumber(int count = 5)
        {
            var betInfos = GetBetInfos(count).ToList();
            betInfos[0].Bets.Add(betInfos[0].Bets);
            return betInfos.Take(count);
        }
        
        private IEnumerable<BetBody> GetBetInfosWithNegativeNumber(int count = 5)
        {
            var betInfos = GetBetInfos(count).ToList();
            betInfos[0].Bets.Add(-1);
            return betInfos.Take(count);
        }
        
        private IEnumerable<BetBody> GetBetInfosWitLargerNumber(int count = 5, int largerNumber = 10)
        {
            var betInfos = GetBetInfos(count).ToList();
            betInfos[0].Bets.Add(largerNumber);
            return betInfos.Take(count);
        }

        private async Task<long> GetRewardAsync(int lotteryType)
        {
            var rewardsOutput = await LotteryContractStub.GetRewards.CallAsync(new Empty());
            return rewardsOutput.Rewards.FirstOrDefault(r => r.Type == lotteryType)?.Amount ?? 0;
        }
    }
}