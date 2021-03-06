import {
  SetToken, Approval,
} from "../generated/SetToken/SetToken"
import { Pair, Pair__getReservesResult } from "../generated/SetToken/Pair"
import { Factory } from "../generated/SetToken/Factory"
import { Token } from "../generated/SetToken/Token"
import { IndexEntity, IndexHistory } from "../generated/schema"
import { Address, Bytes, BigInt, BigDecimal, log } from '@graphprotocol/graph-ts'
const ZERO = BigInt.fromI32(0).toBigDecimal()
export function handleApproval(event: Approval): void {

  let setTokenContract = SetToken.bind(event.address)
  let positions = setTokenContract.getPositions()
  let tokenSumValue = ZERO
  for (let i = 0, l = positions.length; i < l; ++i) {
    let positon = positions[i]
    let entity = new IndexEntity(event.transaction.hash.toHex() + "-" + i.toString())
    entity.component = positon.component
    entity.unit = positon.unit
    entity.timestamp = event.block.timestamp
    let prices = findTokenPrice(entity.component)

    // Disabled for now
    let tokenContract = Token.bind(Address.fromString(entity.component.toHexString()))
    // MKR has different abi hence calling these functions throw error
    if(entity.component == Bytes.fromHexString('0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2')){
      entity.symbol = 'MKR'
      entity.decimals = BigInt.fromI32(18)
    }else{
      entity.symbol = tokenContract.symbol()
      entity.decimals = BigInt.fromI32(tokenContract.decimals())
    }
    // ERROR AS200: Conversion from type '~lib/@graphprotocol/graph-ts/index/BigInt' to 'u8' requires an explicit cast.
    // let precision = BigInt.fromI32(10).pow(entity.decimals).toBigDecimal()
    // ERROR on Reindex: Failed to invoke handler 'handleApproval': out of range integral type conversion attempted wasm backtrace: 0: 0x1ecb - <unknown>!<wasm function 95>
    // let precision = BigInt.fromI32(10).pow(<u8>entity.decimals).toBigDecimal()
    // ERROR AS200: Conversion from type 'i32' to 'u8' requires an explicit cast
    // let precision = BigInt.fromI32(10).pow(entity.decimals.toI32()).toBigDecimal()
    let precision = BigInt.fromI32(10).pow(<u8>(entity.decimals.toI32())).toBigDecimal()
    entity.tokenPrice = prices.tokenPrice
    entity.ethPrice = prices.ethPrice
    entity.tokenBalance = entity.tokenPrice.times(entity.unit.toBigDecimal()).div(precision)
    entity.save()
    tokenSumValue = tokenSumValue.plus(entity.tokenBalance)
  }
  let timeSeries = new IndexHistory(event.transaction.hash.toHex())
  timeSeries.timestamp = event.block.timestamp
  timeSeries.tokenSumValue = tokenSumValue
  timeSeries.dpiValue = findTokenPrice(event.address).tokenPrice

  let diff:BigDecimal
  let two = BigInt.fromI32(2).toBigDecimal()
  let hundred = BigInt.fromI32(100).toBigDecimal()
  if(timeSeries.dpiValue.gt(tokenSumValue)){
    diff = timeSeries.dpiValue.minus(timeSeries.tokenSumValue)
  }else{
    diff = timeSeries.tokenSumValue.minus(timeSeries.dpiValue)
  }
  let sum = timeSeries.dpiValue.plus(timeSeries.tokenSumValue)
  timeSeries.pctDiff = diff.div(sum).div(two).times(hundred)
  timeSeries.save()

  log.warning(
    '*** 4 block {} , tokenSumValue: {}, dpiValue: {} pctDiff: {}',
    [
      event.block.number.toString(),
      timeSeries.tokenSumValue.toString(),
      timeSeries.dpiValue.toString(),
      timeSeries.pctDiff.toString(),
    ]
  );
}

class PriceSet {
  constructor(public tokenPrice: BigDecimal, public ethPrice:BigDecimal) {
    this.tokenPrice = tokenPrice
    this.ethPrice = ethPrice
  }
}

// Modified from https://github.com/Uniswap/uniswap-v2-subgraph/blob/52e385e1a9937217fdfec4e5e4fd063a81161446/src/mappings/pricing.ts#L71
// Because I need to get the price of the specific timestamp, not the daily or hourly summary in the UniSwap Subgraph
export function findTokenPrice(tokenAddress: Bytes): PriceSet {
  let FACTORY_ADDRESS = Address.fromString('0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f')
  let WETH_ADDRESS = Address.fromString('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2')
  let factoryContract = Factory.bind(FACTORY_ADDRESS)
  let pairAddress = factoryContract.getPair(Address.fromString(tokenAddress.toHexString()), WETH_ADDRESS)
  let pairContract = Pair.bind(pairAddress)

  let tryReserves = pairContract.try_getReserves()
  let reserves: Pair__getReservesResult
  if(tryReserves.reverted){
    log.warning('****00091 pairAddress.getReserves failed {}', [pairAddress.toHexString()])
    return new PriceSet(ZERO, ZERO)
  }else{
    reserves = tryReserves.value
    let token0 = pairContract.token0()
    let tokenPrice:BigDecimal // 1 token = x ETH
    let ethPrice:BigDecimal // 1 eth = x token
    if(token0 == tokenAddress){
      tokenPrice = reserves.value1.toBigDecimal().div(reserves.value0.toBigDecimal())
      ethPrice = reserves.value0.toBigDecimal().div(reserves.value1.toBigDecimal())
    }else{
      tokenPrice = reserves.value0.toBigDecimal().div(reserves.value1.toBigDecimal())
      ethPrice = reserves.value1.toBigDecimal().div(reserves.value0.toBigDecimal())
    }
    return new PriceSet(tokenPrice, ethPrice)  
  }
}
