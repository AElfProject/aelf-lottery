using System.IO;
using System.Linq;
using System.Threading.Tasks;
using AElf.Standards.ACS0;
using AElf.Contracts.MultiToken;
using AElf.Contracts.TokenHolder;
using AElf.ContractTestBase.ContractTestKit;
using AElf.Cryptography.ECDSA;
using AElf.EconomicSystem;
using AElf.Kernel;
using AElf.Kernel.Blockchain.Application;
using AElf.Kernel.SmartContract.Application;
using AElf.Kernel.Token;
using AElf.Types;
using Google.Protobuf;
using Microsoft.Extensions.DependencyInjection;
using Volo.Abp.Threading;

namespace AElf.Contracts.LotteryContract
{
    // ReSharper disable InconsistentNaming
    public class LotteryContractTestBase : ContractTestBase<LotteryContractTestModule>
    {
        internal Address LotteryContractAddress { get; }

        internal LotteryContractContainer.LotteryContractStub LotteryContractStub =>
            GetLotteryContractStub(SampleAccount.Accounts.First().KeyPair);

        internal LotteryContractContainer.LotteryContractStub AliceLotteryContractStub =>
            GetLotteryContractStub(AliceKeyPair);

        internal LotteryContractContainer.LotteryContractStub GetLotteryContractStub(ECKeyPair senderKeyPair)
        {
            return GetTester<LotteryContractContainer.LotteryContractStub>(LotteryContractAddress, senderKeyPair);
        }
        
        internal TokenContractContainer.TokenContractStub GetTokenContractStub(ECKeyPair senderKeyPair)
        {
            return GetTester<TokenContractContainer.TokenContractStub>(TokenContractAddress, senderKeyPair);
        }
        
        internal TokenHolderContractContainer.TokenHolderContractStub GetTokenHolderStub(ECKeyPair senderKeyPair)
        {
            return GetTester<TokenHolderContractContainer.TokenHolderContractStub>(SystemContractAddresses[TokenHolderSmartContractAddressNameProvider.Name],
                senderKeyPair);
        }

        internal TokenContractContainer.TokenContractStub TokenContractStub =>
            GetTokenContractStub(SampleAccount.Accounts[0].KeyPair);

        internal ECKeyPair AliceKeyPair { get; set; } = SampleAccount.Accounts.Last().KeyPair;
        internal ECKeyPair BobKeyPair { get; set; } = SampleAccount.Accounts.Reverse().Skip(1).First().KeyPair;
        internal Address AliceAddress => Address.FromPublicKey(AliceKeyPair.PublicKey);
        internal Address BobAddress => Address.FromPublicKey(BobKeyPair.PublicKey);

        protected readonly IBlockTimeProvider BlockTimeProvider;
        public LotteryContractTestBase()
        {
            BlockTimeProvider = Application.ServiceProvider.GetRequiredService<IBlockTimeProvider>();
            LotteryContractAddress = AsyncHelper.RunSync(() => DeployContractAsync(
                KernelConstants.DefaultRunnerCategory,
                File.ReadAllBytes(typeof(LotteryContract).Assembly.Location), SampleAccount.Accounts[0].KeyPair));
        }

        private async Task<Address> DeployContractAsync(int category, byte[] code, ECKeyPair keyPair)
        {
            var addressService = Application.ServiceProvider.GetRequiredService<ISmartContractAddressService>();
            var stub = GetTester<ACS0Container.ACS0Stub>(addressService.GetZeroSmartContractAddress(),
                    keyPair);
            var executionResult = await stub.DeploySmartContract.SendAsync(new ContractDeploymentInput
            {
                Category = category,
                Code = ByteString.CopyFrom(code)
            });
            return executionResult.Output;
        }

        private Address GetAddress(string contractStringName)
        {
            var addressService = Application.ServiceProvider.GetRequiredService<ISmartContractAddressService>();
            var blockchainService = Application.ServiceProvider.GetRequiredService<IBlockchainService>();
            var chain = AsyncHelper.RunSync(blockchainService.GetChainAsync);
            var address = AsyncHelper.RunSync(() => addressService.GetSmartContractAddressAsync(new ChainContext
            {
                BlockHash = chain.BestChainHash,
                BlockHeight = chain.BestChainHeight
            }, contractStringName)).SmartContractAddress.Address;
            return address;
        }
    }
}