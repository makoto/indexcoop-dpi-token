import { BigInt } from "@graphprotocol/graph-ts"
import {
  Contract,
  Approval,
  ComponentAdded,
  ComponentRemoved,
  DefaultPositionUnitEdited,
  ExternalPositionDataEdited,
  ExternalPositionUnitEdited,
  Invoked,
  ManagerEdited,
  ModuleAdded,
  ModuleInitialized,
  ModuleRemoved,
  PendingModuleRemoved,
  PositionModuleAdded,
  PositionModuleRemoved,
  PositionMultiplierEdited,
  Transfer
} from "../generated/Contract/Contract"
import { ExampleEntity } from "../generated/schema"

export function handleApproval(event: Approval): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = ExampleEntity.load(event.transaction.from.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (entity == null) {
    entity = new ExampleEntity(event.transaction.from.toHex())

    // Entity fields can be set using simple assignments
    entity.count = BigInt.fromI32(0)
  }

  // BigInt and BigDecimal math are supported
  entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  entity.owner = event.params.owner
  entity.spender = event.params.spender

  // Entities can be written to the store with `.save()`
  entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.allowance(...)
  // - contract.approve(...)
  // - contract.balanceOf(...)
  // - contract.components(...)
  // - contract.controller(...)
  // - contract.decimals(...)
  // - contract.decreaseAllowance(...)
  // - contract.getComponents(...)
  // - contract.getDefaultPositionRealUnit(...)
  // - contract.getExternalPositionData(...)
  // - contract.getExternalPositionModules(...)
  // - contract.getExternalPositionRealUnit(...)
  // - contract.getModules(...)
  // - contract.getPositions(...)
  // - contract.getTotalComponentRealUnits(...)
  // - contract.increaseAllowance(...)
  // - contract.invoke(...)
  // - contract.isComponent(...)
  // - contract.isExternalPositionModule(...)
  // - contract.isInitializedModule(...)
  // - contract.isLocked(...)
  // - contract.isPendingModule(...)
  // - contract.locker(...)
  // - contract.manager(...)
  // - contract.moduleStates(...)
  // - contract.modules(...)
  // - contract.name(...)
  // - contract.positionMultiplier(...)
  // - contract.symbol(...)
  // - contract.totalSupply(...)
  // - contract.transfer(...)
  // - contract.transferFrom(...)
}

export function handleComponentAdded(event: ComponentAdded): void {}

export function handleComponentRemoved(event: ComponentRemoved): void {}

export function handleDefaultPositionUnitEdited(
  event: DefaultPositionUnitEdited
): void {}

export function handleExternalPositionDataEdited(
  event: ExternalPositionDataEdited
): void {}

export function handleExternalPositionUnitEdited(
  event: ExternalPositionUnitEdited
): void {}

export function handleInvoked(event: Invoked): void {}

export function handleManagerEdited(event: ManagerEdited): void {}

export function handleModuleAdded(event: ModuleAdded): void {}

export function handleModuleInitialized(event: ModuleInitialized): void {}

export function handleModuleRemoved(event: ModuleRemoved): void {}

export function handlePendingModuleRemoved(event: PendingModuleRemoved): void {}

export function handlePositionModuleAdded(event: PositionModuleAdded): void {}

export function handlePositionModuleRemoved(
  event: PositionModuleRemoved
): void {}

export function handlePositionMultiplierEdited(
  event: PositionMultiplierEdited
): void {}

export function handleTransfer(event: Transfer): void {}
