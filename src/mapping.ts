import {
  SetToken, Approval,
} from "../generated/SetToken/SetToken"
import { IndexEntity } from "../generated/schema"
import { log } from '@graphprotocol/graph-ts'


export function handleApproval(event: Approval): void {
  let contract = SetToken.bind(event.address)
  log.warning(
    '*** 1 Block number: {}, block hash: {}, transaction hash: {}',
    [
      event.block.number.toString(),
      event.block.hash.toHexString(),
      event.transaction.hash.toHexString()
    ]
  );
  let positions = contract.getPositions()
  for (let i = 0, l = positions.length; i < l; ++i) {
    let positon = positions[i]
    let entity = new IndexEntity(event.transaction.hash.toHex() + "-" + i.toString())
    entity.component = positon.component
    entity.unit = positon.unit
    entity.timestamp = event.block.timestamp
    entity.save()
    log.warning(
      '*** 2 i: {}, component: {}, unit: {}',
      [
        i.toString(),
        entity.component.toHexString(),
        entity.unit.toHexString()
      ]
    );
  }
}
