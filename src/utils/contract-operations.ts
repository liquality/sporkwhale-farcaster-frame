import * as ethers5 from 'ethers5'
import { CMetadata, PoolParticipation } from '../types'
import {
  HONEYPOT,
  HONEYPOT_ABI,
  COLLECTIVE_FACTORY,
  COLLECTIVE_ABI,
  COLLECTIVE_FACTORY_ABI,
  POOL_ABI,
  C_WALLET_ABI,
} from './constants'
import { QueryResultRow } from '@vercel/postgres'

export async function createCollective(): Promise<CMetadata> {
  try {

    console.log('In here createcollective')

    const provider = getProvider()
    const signer = getSigner(provider)

    const cFactory = getCFactory(signer)
    const salt = generateSalt()
    console.log(salt, 'wats salt?')

    const cAddress = await cFactory.getCollective(
      signer.address,
      signer.address,
      salt
    )
    console.log(cAddress, 'cAddress')
    const cWallet = await cFactory.getCWallet(cAddress, signer.address, salt)
    console.log(cWallet, 'cWallet')

    const tx1 = await cFactory.createCollective(
      signer.address,
      signer.address,
      salt
    )
    console.log(tx1, 'tx one')
    await provider.waitForTransaction(tx1.hash)

    const tx2 = await cFactory.createWallet(
      signer.address,
      signer.address,
      salt
    )
    await provider.waitForTransaction(tx2.hash)

    console.log('Collective created successfully! ', tx1, tx2)

    return { address: cAddress, wallet: cWallet, salt }
  } catch (error) {
    throw new Error('Error creating collective: ' + error)
  }
}

export async function createPool(cAddress: string): Promise<string> {
  try {
    const provider = getProvider()
    const signer = getSigner(provider)

    const honeyPot = HONEYPOT!
    const collective = getCollective(signer, cAddress)

    const tx = await collective.createPools(
      ['0x0000000000000000000000000000000000000000'],
      [honeyPot]
    )
    await provider.waitForTransaction(tx.hash)
    console.log('Pool created successfully! ', tx.hash)

    const pool = await collective.pools(honeyPot)
    return pool['id']
  } catch (error) {
    throw new Error('Error creating pool: ' + error)
  }
}

export async function recordParticipation(
  cAddress: string,
  cWalletAddress: string,
  poolAddress: string,
  participations: PoolParticipation[]
) {
  try {
    const provider = getProvider()
    const signer = getSigner(provider)

    const cWallet = getCWallet(signer, cWalletAddress)
    let data: string[] = []
    let value: number[] = []
    let dest: string[] = []

    for (const participation of participations) {
      const callData = getRecordPoolMintCallData(
        poolAddress,
        participation.user,
        participation.questionId,
        participation.engagement
      )
      data.push(callData)
      value.push(0)
      dest.push(cAddress)
    }

    const tx = await cWallet.executeBatch(dest, value, data)
    await provider.waitForTransaction(tx.hash)
    console.log('Participation recorded onchain successfully! ', tx.hash)
  } catch (error) {
    throw new Error('Error recording participation: ' + error)
  }
}

export async function setTopCollective(
  topContributor: string
): Promise<string> {
  try {
    const provider = getProvider()
    const signer = getSigner(provider)
    const honeyPot = getHonneyPot(signer)

    // console.log("topContributor: ", await honeyPot.getTopContributor());
    const tx = await honeyPot.setTopContributor(topContributor)
    await provider.waitForTransaction(tx.hash)
    console.log('Top contributor set successfully! ', tx.hash)

    return tx.hash
  } catch (error) {
    throw new Error('Error setting top collective: ' + error)
  }
}

// send honeyPot rewards to top contributor
export async function sendRewardToTopCollective(): Promise<string> {
  try {
    const provider = getProvider()
    const signer = getSigner(provider)
    const honeyPot = getHonneyPot(signer)

    const tx = await honeyPot.sendReward()
    await provider.waitForTransaction(tx.hash)
    console.log('Rewards sent successfully! ', tx.hash)

    return tx.hash
  } catch (error) {
    throw new Error('Error sending rewards to top collective: ' + error)
  }
}

// Distribute rewards in pool
export async function distributeRewards(poolAddress: string): Promise<string> {
  try {
    const provider = getProvider()
    const signer = getSigner(provider)
    const pool = await getPool(signer, poolAddress)

    const tx = await pool.distributeReward()
    await provider.waitForTransaction(tx.hash)
    console.log('Rewards distributed successfully! ', tx.hash)

    return tx.hash
  } catch (error) {
    throw new Error('Error distributing rewards: ' + error)
  }
}

// withdraw rewards
export async function batchWithdrawRewards(
  cWalletAddress: string,
  poolAddress: string,
  participants: QueryResultRow[]
): Promise<string> {
  try {
    const provider = getProvider()
    const signer = getSigner(provider)

    const cWallet = getCWallet(signer, cWalletAddress)
    let data: string[] = []
    let value: number[] = []
    let dest: string[] = []

    for (const participant of participants) {
      const callData = getPoolWithdrawCallData(participant.address)
      data.push(callData)
      value.push(0)
      dest.push(poolAddress)
    }

    const tx = await cWallet.executeBatch(dest, value, data, {
      gasLimit: 400000,
    })
    await provider.waitForTransaction(tx.hash)
    console.log('withdrawal successfully!', tx.hash)

    return tx.hash
  } catch (error) {
    throw new Error('Error batch withdrawing rewards: ' + error)
  }
}

// withdraw rewards
export async function withdrawRewards(
  poolAddress: string,
  participant: string
): Promise<string> {
  try {
    const provider = getProvider()
    const signer = getSigner(provider)
    const pool = await getPool(signer, poolAddress)

    const tx = await pool.withdrawReward(participant)
    await provider.waitForTransaction(tx.hash)
    console.log('Rewards withdrawn successfully! ', tx.hash)

    return tx.hash
  } catch (error) {
    throw new Error('Error withdrawing rewards: ' + error)
  }
}

async function getPool(signer: ethers5.ethers.Wallet, poolAddress: string) {
  const pool = new ethers5.Contract(poolAddress, POOL_ABI, signer)
  return pool
}

function getCollective(signer: ethers5.ethers.Wallet, cAddress: string) {
  const collective = new ethers5.Contract(cAddress, COLLECTIVE_ABI, signer)
  return collective
}

function getCFactory(signer: ethers5.ethers.Wallet) {
  const cFactory = new ethers5.Contract(
    COLLECTIVE_FACTORY,
    COLLECTIVE_FACTORY_ABI,
    signer
  )
  return cFactory
}

function getCWallet(signer: ethers5.ethers.Wallet, cWalletAddress: string) {
  const cWallet = new ethers5.Contract(cWalletAddress, C_WALLET_ABI, signer)
  return cWallet
}

function getHonneyPot(signer: ethers5.ethers.Wallet) {
  const honeyPot = new ethers5.Contract(HONEYPOT, HONEYPOT_ABI, signer)
  return honeyPot
}

function getSigner(provider: ethers5.providers.JsonRpcProvider) {
  const signer = ethers5.Wallet.fromMnemonic(
    process.env.OPERATOR_MNEMONIC as string
  ).connect(provider)
  return signer
}

function getProvider() {
  const provider = new ethers5.providers.JsonRpcProvider(process.env.RPC_URL)
  return provider
}

function getRecordPoolMintCallData(
  poolAddress: string,
  participant: string,
  questionId: number,
  engagement: number
) {
  const callData = new ethers5.utils.Interface(
    COLLECTIVE_ABI
  ).encodeFunctionData('recordPoolMint', [
    poolAddress,
    participant,
    questionId,
    engagement,
    0,
  ])
  return callData
}

export function generateSalt(length: number = 16): number {
  const characters = '0123456789'
  const charactersLength = 4
  let salt = ''

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength)
    salt += characters.charAt(randomIndex)
  }

  // Assuming you want to convert the string salt to a BigNumberish
  return Number(salt)
}

function getPoolWithdrawCallData(participant: string) {
  const callData = new ethers5.utils.Interface(POOL_ABI).encodeFunctionData(
    'withdrawReward',
    [participant]
  )
  return callData
}
