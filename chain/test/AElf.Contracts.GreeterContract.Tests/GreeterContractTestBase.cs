﻿using System.IO;
using System.Linq;
using Acs0;
using AElf.ContractTestKit;
using AElf.Cryptography.ECDSA;
using AElf.EconomicSystem;
using AElf.Kernel;
using AElf.Types;
using Google.Protobuf;
using Volo.Abp.Threading;

namespace AElf.Contracts.GreeterContract
{
    public class GreeterContractTestBase : ContractTestBase<GreeterContractTestModule>
    {
        private Address GreeterContractAddress { get; set; }

        private ACS0Container.ACS0Stub ZeroContractStub { get; set; }

        internal GreeterContractContainer.GreeterContractStub GreeterContractStub { get; set; }

        protected GreeterContractTestBase()
        {
            InitializeContracts();
        }

        private void InitializeContracts()
        {
            ZeroContractStub = GetZeroContractStub(SampleAccount.Accounts.First().KeyPair);

            GreeterContractAddress = AsyncHelper.RunSync(() =>
                ZeroContractStub.DeploySystemSmartContract.SendAsync(
                    new SystemContractDeploymentInput
                    {
                        Category = KernelConstants.CodeCoverageRunnerCategory,
                        Code = ByteString.CopyFrom(File.ReadAllBytes(typeof(GreeterContract).Assembly.Location)),
                        Name = ProfitSmartContractAddressNameProvider.Name,
                        TransactionMethodCallList = new SystemContractDeploymentInput.Types.SystemTransactionMethodCallList()
                    })).Output;
            GreeterContractStub = GetGreeterContractStub(SampleAccount.Accounts.First().KeyPair);
        }

        private ACS0Container.ACS0Stub GetZeroContractStub(ECKeyPair keyPair)
        {
            return GetTester<ACS0Container.ACS0Stub>(ContractZeroAddress, keyPair);
        }

        private GreeterContractContainer.GreeterContractStub GetGreeterContractStub(ECKeyPair keyPair)
        {
            return GetTester<GreeterContractContainer.GreeterContractStub>(GreeterContractAddress, keyPair);
        }
    }
}