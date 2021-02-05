using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AElf.Contracts.MultiToken;
using AElf.Contracts.TokenHolder;
using AElf.Kernel.Consensus.Application;
using AElf.Standards.ACS9;
using AElf.Types;
using Google.Protobuf.Collections;
using Google.Protobuf.WellKnownTypes;
using Shouldly;
using Xunit;
using IBlockTimeProvider = AElf.ContractTestBase.ContractTestKit.IBlockTimeProvider;

namespace AElf.Contracts.LotteryContract
{
    // ReSharper disable InconsistentNaming
    public class LotteryContractTests : LotteryContractTestBase
    {
        private const long Price = 10_00000000;

        private LotteryContractContainer.LotteryContractStub AliceLotteryContractStub =>
            GetLotteryContractStub(AliceKeyPair);

        private TokenContractContainer.TokenContractStub AliceTokenContractStub => GetTokenContractStub(AliceKeyPair);

        private LotteryContractContainer.LotteryContractStub BobLotteryContractStub =>
            GetLotteryContractStub(BobKeyPair);

        private TokenContractContainer.TokenContractStub BobTokenContractStub => GetTokenContractStub(BobKeyPair);

        [Fact]
        public async Task InitializeAndCheckStatus()
        {
            await LotteryContractStub.Initialize.SendAsync(new InitializeInput
            {
                TokenSymbol = "ELF",
                MaximumAmount = 100,
                Price = Price,
                DrawingLag = 1,
                StartTimestamp = Timestamp.FromDateTime(DateTime.UtcNow.AddSeconds(1)),
                ShutdownTimestamp = Timestamp.FromDateTime(DateTime.UtcNow.AddSeconds(10))
            });

            var currentPeriod = await LotteryContractStub.GetCurrentPeriod.CallAsync(new Empty());
            currentPeriod.StartId.ShouldBe(1);
            currentPeriod.RandomHash.ShouldBe(Hash.Empty);

            // Transfer some money to Alice & Bob.
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

            await LotteryContractStub.AddRewardList.SendAsync(new RewardList
            {
                RewardMap =
                {
                    {"啊", "一等奖"},
                    {"啊啊", "二等奖"},
                    {"啊啊啊", "三等奖"}
                }
            });
        }

        [Fact]
        public async Task PrepareDrawWithoutSelling()
        {
            await InitializeAndCheckStatus();

            await LotteryContractStub.SetRewardListForOnePeriod.SendAsync(new RewardsInfo
            {
                Period = 1,
                Rewards =
                {
                    {"啊", 1}
                }
            });
            var result = await LotteryContractStub.PrepareDraw.SendWithExceptionAsync(new Empty());
            result.TransactionResult.Error.ShouldContain("Unable to prepare draw because not enough lottery sold.");
        }

        [Fact]
        public async Task BuyTest()
        {
            await InitializeAndCheckStatus();

            {
                var lotteries = await AliceBuy(20, 1);
                lotteries.Count.ShouldBe(20);
            }

            {
                var lotteries = await BobBuy(5, 1);
                lotteries.Count.ShouldBe(5);
            }
        }

        [Fact]
        public async Task Acs9Test()
        {
            await InitializeAndCheckStatus();


            {
                var profitRate = await AliceLotteryContractStub.GetProfitsRate.CallAsync(new Empty());
                profitRate.Value.ShouldBe(0);
            }

            var setProfitsRate =
                await AliceLotteryContractStub.SetProfitsRate.SendWithExceptionAsync(new Int64Value {Value = 10});
            setProfitsRate.TransactionResult.Error.ShouldContain("No permission.");
            await LotteryContractStub.SetProfitsRate.SendAsync(new Int64Value {Value = 10});

            {
                var profitRate = await AliceLotteryContractStub.GetProfitsRate.CallAsync(new Empty());
                profitRate.Value.ShouldBe(10);
            }

            var aliceTokenHolderStub = GetTokenHolderStub(AliceKeyPair);
            await aliceTokenHolderStub.RegisterForProfits.SendAsync(new RegisterForProfitsInput
            {
                SchemeManager = LotteryContractAddress,
                Amount = 10000000_00000000
            });

            {
                var aliceBalance = await TokenContractStub.GetBalance.CallAsync(new GetBalanceInput
                {
                    Symbol = "ELF",
                    Owner = AliceAddress
                });

                aliceBalance.Balance.ShouldBe(90000000_00000000);
            }

            await AliceLotteryContractStub.Buy.SendAsync(new Int64Value
            {
                Value = 100
            });

            {
                var aliceBalance = await TokenContractStub.GetBalance.CallAsync(new GetBalanceInput
                {
                    Symbol = "ELF",
                    Owner = AliceAddress
                });

                aliceBalance.Balance.ShouldBe(89999000_00000000);
            }

            await LotteryContractStub.TakeContractProfits.SendAsync(new TakeContractProfitsInput());

            await aliceTokenHolderStub.ClaimProfits.SendAsync(new ClaimProfitsInput
            {
                Beneficiary = AliceAddress,
                SchemeManager = LotteryContractAddress
            });

            {
                var aliceBalance = await TokenContractStub.GetBalance.CallAsync(new GetBalanceInput
                {
                    Symbol = "ELF",
                    Owner = AliceAddress
                });

                aliceBalance.Balance.ShouldBe(89999001_00000000);
            }

            {
                var aliceBalance = await TokenContractStub.GetBalance.CallAsync(new GetBalanceInput
                {
                    Symbol = "ELF",
                    Owner = LotteryContractAddress
                });

                aliceBalance.Balance.ShouldBe(999_00000000);
            }
        }

        [Fact]
        public async Task PrepareDrawTest()
        {
            await BuyTest(); // buy 25 lotteries

            await LotteryContractStub.SetRewardListForOnePeriod.SendAsync(new RewardsInfo
            {
                Period = 1,
                Rewards =
                {
                    {"啊", 1},
                    {"啊啊", 2},
                    {"啊啊啊", 23}
                }
            });

            var prepare = await LotteryContractStub.PrepareDraw.SendWithExceptionAsync(new Empty());
            prepare.TransactionResult.Error.ShouldContain("Unable to prepare draw because not enough lottery sold.");

            await LotteryContractStub.SetRewardListForOnePeriod.SendAsync(new RewardsInfo
            {
                Period = 1,
                Rewards =
                {
                    {"啊", 1},
                    {"啊啊", 2},
                    {"啊啊啊", 21}
                }
            });
            await LotteryContractStub.PrepareDraw.SendAsync(new Empty());

            var currentPeriodNumber = await LotteryContractStub.GetCurrentPeriodNumber.CallAsync(new Empty());
            currentPeriodNumber.Value.ShouldBe(2);

            var period = await LotteryContractStub.GetPeriod.CallAsync(new Int64Value {Value = 2});
            period.RandomHash.ShouldBe(Hash.Empty);
            period.StartId.ShouldBe(26);

            var result = await LotteryContractStub.PrepareDraw.SendWithExceptionAsync(new Empty());
            result.TransactionResult.Error.ShouldContain("hasn't drew.");
        }

        [Fact]
        public async Task DrawTest()
        {
            await PrepareDrawTest();

            await LotteryContractStub.Draw.SendAsync(new Int64Value {Value = 1});
            var period = await LotteryContractStub.GetPeriod.CallAsync(new Int64Value {Value = 1});
            period.RandomHash.ShouldNotBe(Hash.Empty);
            period.ActualDrawDate.ShouldNotBe(null);
            var rewardResult = await LotteryContractStub.GetRewardResult.CallAsync(new Int64Value
            {
                Value = 1
            });
            var reward =
                rewardResult.RewardLotteries.First(r => r.Owner == AliceAddress && !string.IsNullOrEmpty(r.RewardName));
            const string registrationInformation = "hiahiahia";
            await AliceLotteryContractStub.TakeReward.SendAsync(new TakeRewardInput
            {
                LotteryId = reward.Id,
                RegistrationInformation = registrationInformation
            });

            var lottery = await LotteryContractStub.GetLottery.CallAsync(new Int64Value {Value = reward.Id});
            lottery.RegistrationInformation.ShouldBe(registrationInformation);
        }

        [Fact]
        public async Task DrawTwiceTest()
        {
            await DrawTest(); // buy 25 lotteries

            {
                var draw = await LotteryContractStub.Draw.SendWithExceptionAsync(new Int64Value {Value = 1});
                draw.TransactionResult.Error.ShouldContain("Latest period already drawn.");
            }

            {
                var prepare = await LotteryContractStub.PrepareDraw.SendWithExceptionAsync(new Empty());
                prepare.TransactionResult.Error.ShouldContain("Reward pool cannot be empty.");
            }
            await LotteryContractStub.SetRewardListForOnePeriod.SendAsync(new RewardsInfo
            {
                Period = 2,
                Rewards =
                {
                    {"啊", 1},
                    {"啊啊", 2},
                }
            });

            {
                var boughtLotteries = await LotteryContractStub.GetBoughtLotteries.CallAsync(new GetBoughtLotteriesInput
                {
                    Owner = AliceAddress,
                    StartId = -1
                });

                boughtLotteries.Lotteries.Count.ShouldBe(20); //20 is max
                boughtLotteries.Lotteries.First().Id.ShouldBe(1);
                boughtLotteries.Lotteries.Last().Id.ShouldBe(20);
            }

            {
                var boughtLotteries = await LotteryContractStub.GetBoughtLotteries.CallAsync(new GetBoughtLotteriesInput
                {
                    Owner = AliceAddress,
                    StartId = 0
                });

                boughtLotteries.Lotteries.Count.ShouldBe(20); //20 is max
                boughtLotteries.Lotteries.First().Id.ShouldBe(1);
                boughtLotteries.Lotteries.Last().Id.ShouldBe(20);
            }

            {
                var boughtLotteries = await LotteryContractStub.GetBoughtLotteries.CallAsync(new GetBoughtLotteriesInput
                {
                    Owner = AliceAddress,
                    StartId = 1
                });

                boughtLotteries.Lotteries.Count.ShouldBe(19);
                boughtLotteries.Lotteries.First().Id.ShouldBe(2);
                boughtLotteries.Lotteries.Last().Id.ShouldBe(20);
            }

            {
                var boughtLotteries = await LotteryContractStub.GetBoughtLotteries.CallAsync(new GetBoughtLotteriesInput
                {
                    Owner = AliceAddress,
                    StartId = 19
                });

                boughtLotteries.Lotteries.Count.ShouldBe(1);
                boughtLotteries.Lotteries.Last().Id.ShouldBe(20);
            }

            {
                var boughtLotteries = await LotteryContractStub.GetBoughtLotteries.CallAsync(new GetBoughtLotteriesInput
                {
                    Owner = AliceAddress,
                    StartId = 20
                });

                boughtLotteries.Lotteries.Count.ShouldBe(0);
            }

            // in period 2, 26th lottery
            await AliceLotteryContractStub.Buy.SendAsync(new Int64Value
            {
                Value = 1
            });


            {
                var boughtLotteries = await LotteryContractStub.GetBoughtLotteries.CallAsync(new GetBoughtLotteriesInput
                {
                    Owner = AliceAddress,
                    StartId = -1
                });

                boughtLotteries.Lotteries.Count.ShouldBe(20); //20 is max
                boughtLotteries.Lotteries.First().Id.ShouldBe(1);
                boughtLotteries.Lotteries.Last().Id.ShouldBe(20);
            }

            {
                var boughtLotteries = await LotteryContractStub.GetBoughtLotteries.CallAsync(new GetBoughtLotteriesInput
                {
                    Owner = AliceAddress,
                    StartId = 0
                });

                boughtLotteries.Lotteries.Count.ShouldBe(20); //20 is max
                boughtLotteries.Lotteries.First().Id.ShouldBe(1);
                boughtLotteries.Lotteries.Last().Id.ShouldBe(20);
            }

            {
                var boughtLotteries = await LotteryContractStub.GetBoughtLotteries.CallAsync(new GetBoughtLotteriesInput
                {
                    Owner = AliceAddress,
                    StartId = 1
                });

                boughtLotteries.Lotteries.Count.ShouldBe(20);
                boughtLotteries.Lotteries.First().Id.ShouldBe(2);
                boughtLotteries.Lotteries.Last().Id.ShouldBe(26);
            }

            {
                var boughtLotteries = await LotteryContractStub.GetBoughtLotteries.CallAsync(new GetBoughtLotteriesInput
                {
                    Owner = AliceAddress,
                    StartId = 1
                });

                boughtLotteries.Lotteries.Count.ShouldBe(20);
                boughtLotteries.Lotteries.First().Id.ShouldBe(2);
                boughtLotteries.Lotteries.Last().Id.ShouldBe(26);
            }

            {
                var boughtLotteries = await LotteryContractStub.GetBoughtLotteries.CallAsync(new GetBoughtLotteriesInput
                {
                    Owner = AliceAddress,
                    StartId = 20
                });

                boughtLotteries.Lotteries.Count.ShouldBe(1);
                boughtLotteries.Lotteries.Last().Id.ShouldBe(26);
            }

            {
                var boughtLotteries = await LotteryContractStub.GetBoughtLotteries.CallAsync(new GetBoughtLotteriesInput
                {
                    Owner = AliceAddress,
                    StartId = 26
                });

                boughtLotteries.Lotteries.Count.ShouldBe(0);
            }

            {
                var prepare = await LotteryContractStub.PrepareDraw.SendWithExceptionAsync(new Empty());
                prepare.TransactionResult.Error.ShouldContain(
                    "Unable to prepare draw because not enough lottery sold.");
            }

            await LotteryContractStub.SetRewardListForOnePeriod.SendAsync(new RewardsInfo
            {
                Period = 2,
                Rewards =
                {
                    {"啊", 1}
                }
            });
            await LotteryContractStub.PrepareDraw.SendAsync(new Empty());

            //in period 3, 27th lottery
            await AliceLotteryContractStub.Buy.SendAsync(new Int64Value
            {
                Value = 1
            });

            {
                var boughtLotteries = await LotteryContractStub.GetBoughtLotteries.CallAsync(new GetBoughtLotteriesInput
                {
                    Owner = AliceAddress,
                    StartId = -1
                });

                boughtLotteries.Lotteries.Count.ShouldBe(20); //20 is max
                boughtLotteries.Lotteries.First().Id.ShouldBe(1);
                boughtLotteries.Lotteries.Last().Id.ShouldBe(20);
            }

            {
                var boughtLotteries = await LotteryContractStub.GetBoughtLotteries.CallAsync(new GetBoughtLotteriesInput
                {
                    Owner = AliceAddress,
                    StartId = 0
                });

                boughtLotteries.Lotteries.Count.ShouldBe(20); //20 is max
                boughtLotteries.Lotteries.First().Id.ShouldBe(1);
                boughtLotteries.Lotteries.Last().Id.ShouldBe(20);
            }

            {
                var boughtLotteries = await LotteryContractStub.GetBoughtLotteries.CallAsync(new GetBoughtLotteriesInput
                {
                    Owner = AliceAddress,
                    StartId = 1
                });

                boughtLotteries.Lotteries.Count.ShouldBe(20);
                boughtLotteries.Lotteries.First().Id.ShouldBe(2);
                boughtLotteries.Lotteries.Last().Id.ShouldBe(26);
            }

            {
                var boughtLotteries = await LotteryContractStub.GetBoughtLotteries.CallAsync(new GetBoughtLotteriesInput
                {
                    Owner = AliceAddress,
                    StartId = 2
                });

                boughtLotteries.Lotteries.Count.ShouldBe(20);
                boughtLotteries.Lotteries.First().Id.ShouldBe(3);
                boughtLotteries.Lotteries.Last().Id.ShouldBe(27);
            }

            {
                var boughtLotteries = await LotteryContractStub.GetBoughtLotteries.CallAsync(new GetBoughtLotteriesInput
                {
                    Owner = AliceAddress,
                    StartId = 26
                });

                boughtLotteries.Lotteries.Count.ShouldBe(1);
                boughtLotteries.Lotteries.Last().Id.ShouldBe(27);
            }

            {
                var boughtLotteries = await LotteryContractStub.GetBoughtLotteries.CallAsync(new GetBoughtLotteriesInput
                {
                    Owner = AliceAddress,
                    StartId = 27
                });

                boughtLotteries.Lotteries.Count.ShouldBe(0);
            }

            var currentPeriodNumber = await LotteryContractStub.GetCurrentPeriodNumber.CallAsync(new Empty());
            currentPeriodNumber.Value.ShouldBe(3);

            {
                var period = await LotteryContractStub.GetPeriod.CallAsync(new Int64Value {Value = 3});
                period.RandomHash.ShouldBe(Hash.Empty);
                period.StartId.ShouldBe(27);
            }

            await LotteryContractStub.Draw.SendAsync(new Int64Value {Value = 2});

            {
                var period = await LotteryContractStub.GetPeriod.CallAsync(new Int64Value {Value = 2});
                period.RewardIds.Count.ShouldBe(1);

                var lotteryCount = await LotteryContractStub.GetAllLotteriesCount.CallAsync(new Empty());

                period.RewardIds.First().ShouldBe(26);
            }

            //in period 3, 28th, 29th lottery
            await AliceLotteryContractStub.Buy.SendAsync(new Int64Value
            {
                Value = 2
            });


            {
                var boughtLotteries = await LotteryContractStub.GetBoughtLotteries.CallAsync(new GetBoughtLotteriesInput
                {
                    Owner = AliceAddress,
                    StartId = -1
                });

                boughtLotteries.Lotteries.Count.ShouldBe(20); //20 is max
                boughtLotteries.Lotteries.First().Id.ShouldBe(1);
                boughtLotteries.Lotteries.Last().Id.ShouldBe(20);
            }

            {
                var boughtLotteries = await LotteryContractStub.GetBoughtLotteries.CallAsync(new GetBoughtLotteriesInput
                {
                    Owner = AliceAddress,
                    StartId = 0
                });

                boughtLotteries.Lotteries.Count.ShouldBe(20); //20 is max
                boughtLotteries.Lotteries.First().Id.ShouldBe(1);
                boughtLotteries.Lotteries.Last().Id.ShouldBe(20);
            }

            {
                var boughtLotteries = await LotteryContractStub.GetBoughtLotteries.CallAsync(new GetBoughtLotteriesInput
                {
                    Owner = AliceAddress,
                    StartId = 1
                });

                boughtLotteries.Lotteries.Count.ShouldBe(20);
                boughtLotteries.Lotteries.First().Id.ShouldBe(2);
                boughtLotteries.Lotteries.Last().Id.ShouldBe(26);
            }

            {
                var boughtLotteries = await LotteryContractStub.GetBoughtLotteries.CallAsync(new GetBoughtLotteriesInput
                {
                    Owner = AliceAddress,
                    StartId = 2
                });

                boughtLotteries.Lotteries.Count.ShouldBe(20);
                boughtLotteries.Lotteries.First().Id.ShouldBe(3);
                boughtLotteries.Lotteries.Last().Id.ShouldBe(27);
            }

            {
                var boughtLotteries = await LotteryContractStub.GetBoughtLotteries.CallAsync(new GetBoughtLotteriesInput
                {
                    Owner = AliceAddress,
                    StartId = 3
                });

                boughtLotteries.Lotteries.Count.ShouldBe(20);
                boughtLotteries.Lotteries.First().Id.ShouldBe(4);
                boughtLotteries.Lotteries.Last().Id.ShouldBe(28);
            }

            {
                var boughtLotteries = await LotteryContractStub.GetBoughtLotteries.CallAsync(new GetBoughtLotteriesInput
                {
                    Owner = AliceAddress,
                    StartId = 4
                });

                boughtLotteries.Lotteries.Count.ShouldBe(20);
                boughtLotteries.Lotteries.First().Id.ShouldBe(5);
                boughtLotteries.Lotteries.Last().Id.ShouldBe(29);
            }

            {
                var boughtLotteries = await LotteryContractStub.GetBoughtLotteries.CallAsync(new GetBoughtLotteriesInput
                {
                    Owner = AliceAddress,
                    StartId = 27
                });

                boughtLotteries.Lotteries.Count.ShouldBe(2);
                boughtLotteries.Lotteries.First().Id.ShouldBe(28);
                boughtLotteries.Lotteries.Last().Id.ShouldBe(29);
            }

            {
                var boughtLotteries = await LotteryContractStub.GetBoughtLotteries.CallAsync(new GetBoughtLotteriesInput
                {
                    Owner = AliceAddress,
                    StartId = 28
                });

                boughtLotteries.Lotteries.Count.ShouldBe(1);
                boughtLotteries.Lotteries.First().Id.ShouldBe(29);
            }

            {
                var boughtLotteries = await LotteryContractStub.GetBoughtLotteries.CallAsync(new GetBoughtLotteriesInput
                {
                    Owner = AliceAddress,
                    StartId = 29
                });

                boughtLotteries.Lotteries.Count.ShouldBe(0);
            }

            await LotteryContractStub.SetRewardListForOnePeriod.SendAsync(new RewardsInfo
            {
                Period = 3,
                Rewards =
                {
                    {"啊", 3}
                }
            });

            {
                var boughtLotteries = await LotteryContractStub.GetBoughtLotteries.CallAsync(new GetBoughtLotteriesInput
                {
                    Owner = AliceAddress,
                    StartId = 0,
                    Period = 3
                });

                boughtLotteries.Lotteries.Count.ShouldBe(3);
                boughtLotteries.Lotteries.First().Id.ShouldBe(27);
                boughtLotteries.Lotteries.Last().Id.ShouldBe(29);
            }

            {
                var boughtLotteries = await LotteryContractStub.GetBoughtLotteries.CallAsync(new GetBoughtLotteriesInput
                {
                    Owner = AliceAddress,
                    StartId = 28,
                    Period = 3
                });

                boughtLotteries.Lotteries.Count.ShouldBe(1);
                boughtLotteries.Lotteries.Last().Id.ShouldBe(29);
            }

            await LotteryContractStub.PrepareDraw.SendAsync(new Empty());
            await LotteryContractStub.Draw.SendAsync(new Int64Value {Value = 3});

            {
                var period = await LotteryContractStub.GetPeriod.CallAsync(new Int64Value {Value = 3});
                period.RewardIds.Count.ShouldBe(3);

                period.RewardIds.ShouldContain(27);
                period.RewardIds.ShouldContain(28);
                period.RewardIds.ShouldContain(29);
            }
        }


        private async Task<RepeatedField<Lottery>> AliceBuy(int amount, long period)
        {
            var boughtInformation = (await AliceLotteryContractStub.Buy.SendAsync(new Int64Value
            {
                Value = amount
            })).Output;

            boughtInformation.Amount.ShouldBe(amount);

            var boughtInfo = await LotteryContractStub.GetBoughtLotteries.CallAsync(new GetBoughtLotteriesInput
            {
                Owner = AliceAddress,
                Period = period
            });
            boughtInfo.Lotteries.First().Id.ShouldBe(boughtInformation.StartId);
            return boughtInfo.Lotteries;
        }

        private async Task<RepeatedField<Lottery>> BobBuy(int amount, long period)
        {
            var boughtInformation = (await BobLotteryContractStub.Buy.SendAsync(new Int64Value
            {
                Value = amount
            })).Output;

            boughtInformation.Amount.ShouldBe(amount);

            var boughtOutput = await LotteryContractStub.GetBoughtLotteries.CallAsync(new GetBoughtLotteriesInput
            {
                Owner = BobAddress,
                Period = period
            });
            boughtOutput.Lotteries.Last().Id.ShouldBe(boughtInformation.StartId + boughtInformation.Amount - 1);
            return boughtOutput.Lotteries;
        }

        [Fact]
        public void TestGetRanks()
        {
            var levelsCount = new List<int> {0, 1, 2, 3, 4};
            var ranks = GetRanks(levelsCount);
            ranks.Count.ShouldBe(10);
            ranks.ShouldBe(new List<int> {2, 3, 3, 4, 4, 4, 5, 5, 5, 5});
        }

        [Fact]
        public async Task StakingTest()
        {
            await LotteryContractStub.Initialize.SendAsync(new InitializeInput
            {
                TokenSymbol = "ELF",
                MaximumAmount = 100,
                Price = Price,
                DrawingLag = 1,
                StartTimestamp = Timestamp.FromDateTime(DateTime.UtcNow.AddSeconds(1)),
                ShutdownTimestamp = Timestamp.FromDateTime(DateTime.UtcNow.AddSeconds(10))
            });


            // Transfer some money to Alice & Bob.
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


            GetRequiredService<IBlockTimeProvider>()
                .SetBlockTime(Timestamp.FromDateTime(DateTime.UtcNow.AddSeconds(1)));
            await AliceLotteryContractStub.Stake.SendAsync(new Int64Value {Value = 100_000_000});


            {
                var stakingAmount = await AliceLotteryContractStub.GetStakingAmount.CallAsync(AliceAddress);
                stakingAmount.Value.ShouldBe(100_000_000);
            }

            {
                var stakingTotal = await AliceLotteryContractStub.GetStakingTotal.CallAsync(new Empty());
                stakingTotal.Value.ShouldBe(100_000_000);
            }

            await BobLotteryContractStub.Stake.SendAsync(new Int64Value {Value = 1000_000_000});
            {
                var stakingAmount = await AliceLotteryContractStub.GetStakingAmount.CallAsync(BobAddress);
                stakingAmount.Value.ShouldBe(1000_000_000);
            }

            {
                var stakingTotal = await AliceLotteryContractStub.GetStakingTotal.CallAsync(new Empty());
                stakingTotal.Value.ShouldBe(1100_000_000);
            }

            {
                var take = await AliceLotteryContractStub.TakeDividend.SendWithExceptionAsync(new Empty());
                take.TransactionResult.Error.ShouldContain("DividendRate not set.");
            }

            {
                var stake = await LotteryContractStub.SetDividendRate.SendWithExceptionAsync(new Int64Value
                    {Value = 1000});
                stake.TransactionResult.Error.ShouldContain("Staking not shutdown.");
            }

            GetRequiredService<IBlockTimeProvider>()
                .SetBlockTime(Timestamp.FromDateTime(DateTime.UtcNow.AddSeconds(10)));

            {
                var stake = await AliceLotteryContractStub.Stake.SendWithExceptionAsync(new Int64Value
                    {Value = 100_000_000});
                stake.TransactionResult.Error.ShouldContain("Staking shutdown.");
            }

            {
                var setDividendRate =
                    await AliceLotteryContractStub.SetDividendRate.SendWithExceptionAsync(new Int64Value
                        {Value = 1000});
                setDividendRate.TransactionResult.Error.ShouldContain("No permission.");
            }

            await LotteryContractStub.SetDividendRate.SendAsync(new Int64Value {Value = 1000});

            var stakingAmountBefore = await AliceLotteryContractStub.GetStakingAmount.CallAsync(AliceAddress);
            var balanceBefore = await TokenContractStub.GetBalance.CallAsync(new GetBalanceInput
            {
                Owner = AliceAddress,
                Symbol = "ELF"
            });

            var total = await AliceLotteryContractStub.GetStakingTotal.CallAsync(new Empty());
            await AliceLotteryContractStub.TakeDividend.SendAsync(new Empty());
            var stakingAmountAfter = await AliceLotteryContractStub.GetStakingAmount.CallAsync(AliceAddress);
            stakingAmountAfter.Value.ShouldBe(0);

            var balanceAfter = await TokenContractStub.GetBalance.CallAsync(new GetBalanceInput
            {
                Owner = AliceAddress,
                Symbol = "ELF"
            });
            (balanceAfter.Balance - balanceBefore.Balance).ShouldBe(stakingAmountBefore.Value / 10);
        }

        [Fact]
        public async Task StakingShutdownTimestampTest()
        {
            await LotteryContractStub.Initialize.SendAsync(new InitializeInput
            {
                TokenSymbol = "ELF",
                MaximumAmount = 100,
                Price = Price,
                DrawingLag = 1,
                StartTimestamp = Timestamp.FromDateTime(DateTime.UtcNow.AddSeconds(1)),
                ShutdownTimestamp = Timestamp.FromDateTime(DateTime.UtcNow.AddSeconds(10))
            });

            // Transfer some money to Alice & Bob.
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

            {
                var setStakingShutdown = await AliceLotteryContractStub.SetStakingTimestamp.SendWithExceptionAsync(
                    new SetStakingTimestampInput
                        {Timestamp = Timestamp.FromDateTime(DateTime.UtcNow), IsStartTimestamp = false});
                setStakingShutdown.TransactionResult.Error.ShouldContain("No permission.");
            }


            {
                var setStakingShutdown =
                    await LotteryContractStub.SetStakingTimestamp.SendWithExceptionAsync(
                        new SetStakingTimestampInput
                        {
                            Timestamp = Timestamp.FromDateTime(DateTime.UtcNow.AddSeconds(-1)), IsStartTimestamp = false
                        });
                setStakingShutdown.TransactionResult.Error.ShouldContain("Invalid shutdown timestamp.");
            }

            {
                var setStakingShutdown =
                    await LotteryContractStub.SetStakingTimestamp.SendWithExceptionAsync(
                        new SetStakingTimestampInput
                        {
                            Timestamp = Timestamp.FromDateTime(DateTime.UtcNow.AddSeconds(0.5)),
                            IsStartTimestamp = false
                        });
                setStakingShutdown.TransactionResult.Error.ShouldContain("Invalid shutdown timestamp.");
            }

            {
                var time = Timestamp.FromDateTime(DateTime.UtcNow.AddSeconds(10));
                await LotteryContractStub.SetStakingTimestamp.SendAsync(new SetStakingTimestampInput
                    {Timestamp = time, IsStartTimestamp = false});
                var shutdownTimestamp = await LotteryContractStub.GetStakingTimestamp.CallAsync(new Empty());
                shutdownTimestamp.ShutdownTimestamp.ShouldBe(time);
            }

            {
                var setStakingShutdown =
                    await LotteryContractStub.SetStakingTimestamp.SendWithExceptionAsync(
                        new SetStakingTimestampInput
                            {Timestamp = Timestamp.FromDateTime(DateTime.UtcNow), IsStartTimestamp = false});
                setStakingShutdown.TransactionResult.Error.ShouldContain("Invalid shutdown timestamp.");
            }

            GetRequiredService<IBlockTimeProvider>()
                .SetBlockTime(Timestamp.FromDateTime(DateTime.UtcNow.AddSeconds(1)));
            await AliceLotteryContractStub.Stake.SendAsync(new Int64Value {Value = 1000});

            {
                var time = Timestamp.FromDateTime(DateTime.UtcNow.AddSeconds(3));
                await LotteryContractStub.SetStakingTimestamp.SendAsync(new SetStakingTimestampInput
                    {Timestamp = time, IsStartTimestamp = false});
                var shutdownTimestamp = await LotteryContractStub.GetStakingTimestamp.CallAsync(new Empty());
                shutdownTimestamp.ShutdownTimestamp.ShouldBe(time);
            }

            GetRequiredService<IBlockTimeProvider>()
                .SetBlockTime(Timestamp.FromDateTime(DateTime.UtcNow.AddSeconds(10)));


            {
                var stake = await AliceLotteryContractStub.Stake.SendWithExceptionAsync(new Int64Value {Value = 1000});
                stake.TransactionResult.Error.ShouldContain("Staking shutdown.");
            }

            {
                var time = Timestamp.FromDateTime(DateTime.UtcNow.AddSeconds(10));
                await LotteryContractStub.SetStakingTimestamp.SendAsync(new SetStakingTimestampInput
                    {Timestamp = time, IsStartTimestamp = false});
                var shutdownTimestamp = await LotteryContractStub.GetStakingTimestamp.CallAsync(new Empty());
                shutdownTimestamp.ShutdownTimestamp.ShouldBe(time);
            }

            GetRequiredService<IBlockTimeProvider>()
                .SetBlockTime(Timestamp.FromDateTime(DateTime.UtcNow.AddSeconds(1)));
            await AliceLotteryContractStub.Stake.SendAsync(new Int64Value {Value = 1000});
        }

        [Fact]
        public async Task StakingStartTimestampTest()
        {
            await LotteryContractStub.Initialize.SendAsync(new InitializeInput
            {
                TokenSymbol = "ELF",
                MaximumAmount = 100,
                Price = Price,
                DrawingLag = 1,
                StartTimestamp = Timestamp.FromDateTime(DateTime.UtcNow.AddSeconds(5)),
                ShutdownTimestamp = Timestamp.FromDateTime(DateTime.UtcNow.AddSeconds(10))
            });

            // Transfer some money to Alice & Bob.
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

            {
                var stake = await AliceLotteryContractStub.Stake.SendWithExceptionAsync(new Int64Value {Value = 1000});
                stake.TransactionResult.Error.ShouldContain("Staking not started.");
            }


            {
                var setStakingShutdown = await AliceLotteryContractStub.SetStakingTimestamp.SendWithExceptionAsync(
                    new SetStakingTimestampInput
                        {Timestamp = Timestamp.FromDateTime(DateTime.UtcNow), IsStartTimestamp = true});
                setStakingShutdown.TransactionResult.Error.ShouldContain("No permission.");
            }


            {
                var setStakingShutdown =
                    await LotteryContractStub.SetStakingTimestamp.SendWithExceptionAsync(
                        new SetStakingTimestampInput
                        {
                            Timestamp = Timestamp.FromDateTime(DateTime.UtcNow.AddSeconds(-1)), IsStartTimestamp = true
                        });
                setStakingShutdown.TransactionResult.Error.ShouldContain("Invalid start timestamp.");
            }

            {
                var setStakingShutdown =
                    await LotteryContractStub.SetStakingTimestamp.SendWithExceptionAsync(
                        new SetStakingTimestampInput
                        {
                            Timestamp = Timestamp.FromDateTime(DateTime.UtcNow.AddSeconds(10)), IsStartTimestamp = true
                        });
                setStakingShutdown.TransactionResult.Error.ShouldContain("Invalid start timestamp.");
            }

            {
                var time = Timestamp.FromDateTime(DateTime.UtcNow.AddSeconds(1));
                await LotteryContractStub.SetStakingTimestamp.SendAsync(new SetStakingTimestampInput
                    {Timestamp = time, IsStartTimestamp = true});
                var shutdownTimestamp = await LotteryContractStub.GetStakingTimestamp.CallAsync(new Empty());
                shutdownTimestamp.StartTimestamp.ShouldBe(time);
            }


            {
                var stake = await AliceLotteryContractStub.Stake.SendWithExceptionAsync(new Int64Value {Value = 1000});
                stake.TransactionResult.Error.ShouldContain("Staking not started.");
            }
            GetRequiredService<IBlockTimeProvider>()
                .SetBlockTime(Timestamp.FromDateTime(DateTime.UtcNow.AddSeconds(2)));
            await AliceLotteryContractStub.Stake.SendAsync(new Int64Value {Value = 1000});

            {
                var setStakingShutdown =
                    await LotteryContractStub.SetStakingTimestamp.SendWithExceptionAsync(
                        new SetStakingTimestampInput
                            {Timestamp = Timestamp.FromDateTime(DateTime.UtcNow), IsStartTimestamp = true});
                setStakingShutdown.TransactionResult.Error.ShouldContain("Start timestamp already passed.");
            }
        }

        [Fact]
        public async Task TakeBackTokentTest()
        {
            await InitializeAndCheckStatus();
            await TokenContractStub.Transfer.SendAsync(new TransferInput
            {
                Amount = 1000_000_000_000,
                Symbol = "ELF",
                To = LotteryContractAddress
            });

            var adminBalanceBefore = await TokenContractStub.GetBalance.CallAsync(new GetBalanceInput
            {
                Owner = DefaultAccount.Address,
                Symbol = "ELF"
            });

            var lotteryBalanceBefore = await TokenContractStub.GetBalance.CallAsync(new GetBalanceInput
            {
                Owner = LotteryContractAddress,
                Symbol = "ELF"
            });

            var takeBack = await AliceLotteryContractStub.TakeBackToken.SendWithExceptionAsync(new TakeBackTokenInput
            {
                Symbol = "ELF",
                Amount = 1000_000_000_000
            });

            takeBack.TransactionResult.Error.ShouldContain("No permission.");

            await LotteryContractStub.TakeBackToken.SendAsync(new TakeBackTokenInput
            {
                Symbol = "ELF",
                Amount = 1000_000_000_000
            });

            var adminBalanceAfter = await TokenContractStub.GetBalance.CallAsync(new GetBalanceInput
            {
                Owner = DefaultAccount.Address,
                Symbol = "ELF"
            });

            var lotteryBalanceAfter = await TokenContractStub.GetBalance.CallAsync(new GetBalanceInput
            {
                Owner = LotteryContractAddress,
                Symbol = "ELF"
            });

            (adminBalanceAfter.Balance - adminBalanceBefore.Balance).ShouldBe(1000_000_000_000);
            (lotteryBalanceBefore.Balance - lotteryBalanceAfter.Balance).ShouldBe(1000_000_000_000);
        }


        private List<int> GetRanks(List<int> levelsCount)
        {
            var ranks = new List<int>();

            for (var i = 0; i < levelsCount.Count; i++)
            {
                for (var j = 0; j < levelsCount[i]; j++)
                {
                    ranks.Add(i + 1);
                }
            }

            return ranks;
        }
    }
}