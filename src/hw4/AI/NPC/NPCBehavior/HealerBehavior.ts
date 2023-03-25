import NPCActor from "../../../Actors/NPCActor";
import NPCBehavior from "../NPCBehavior";
import GoalReached from "../NPCStatuses/FalseStatus";
import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import Idle from "../NPCActions/GotoAction";
import { TargetExists } from "../NPCStatuses/TargetExists";
import BasicFinder from "../../../GameSystems/Searching/BasicFinder";
import { ClosestPositioned } from "../../../GameSystems/Searching/HW4Reducers";
import { AllyFilter, BattlerActiveFilter, BattlerGroupFilter, BattlerHealthFilter, CustomFilter, EnemyFilter, ItemFilter, RangeFilter, VisibleItemFilter } from "../../../GameSystems/Searching/HW4Filters";
import PickupItem from "../NPCActions/PickupItem";
import UseHealthpack from "../NPCActions/UseHealthpack";
import Healthpack from "../../../GameSystems/ItemSystem/Items/Healthpack";
import Item from "../../../GameSystems/ItemSystem/Item";
import { HasItem } from "../NPCStatuses/HasItem";
import FalseStatus from "../NPCStatuses/FalseStatus";
import Battler from "../../../GameSystems/BattleSystem/Battler";
import { TargetableEntity } from "../../../GameSystems/Targeting/TargetableEntity";
import LaserGun from "../../../GameSystems/ItemSystem/Items/LaserGun";
import ShootLaserGun from "../NPCActions/ShootLaserGun";
import GoapAction from "../../../../Wolfie2D/AI/Goap/GoapAction";
import GoapState from "../../../../Wolfie2D/AI/Goap/GoapState";


// /**
//  * When an NPC is acting as a healer, their goal is to try and heal it's teammates by running around, picking up healthpacks, 
//  * bringing to the healthpacks to their allies and healing them.
//  */
//  export interface GuardOptions {
//     target: TargetableEntity
//     range: number;
// }

// export type GuardStatus = typeof GuardStatuses[keyof typeof GuardStatuses];
// export const GuardStatuses = {

//     ENEMY_IN_GUARD_POSITION: "enemy-at-guard-position",

//     HAS_WEAPON: "has-weapon",

//     LASERGUN_EXISTS: "laser-gun-exists",

//     GOAL: "goal"

// } as const;

// export type GuardAction = typeof GuardActions[keyof typeof GuardActions];
// export const GuardActions = {

//     PICKUP_LASER_GUN: "pickup-lasergun",

//     SHOOT_ENEMY: "shoot-enemy",

//     GUARD: "guard",

// } as const;

// export default class HealerBehavior extends NPCBehavior  {

//     /** The GameNode that owns this NPCGoapAI */
//     protected override owner: NPCActor;

//     protected target: TargetableEntity;
    
//     /** Initialize the NPC AI */
//     public initializeAI(owner: NPCActor, opts: Record<string, any>): void {
//         super.initializeAI(owner, opts);

//         let scene = owner.getScene();

//         /* ######### Add all healer statuses ######## */

        

//         // Check if a healthpack exists in the scene and it's visible
//         this.addStatus(HealerStatuses.HPACK_EXISTS, new TargetExists(scene.getHealthpacks(), new BasicFinder<Item>(null, ItemFilter(Healthpack), VisibleItemFilter())));

//         // Check if a healthpack exists in the actors inventory
//         this.addStatus(HealerStatuses.HAS_HPACK, new HasItem(owner, new BasicFinder<Item>(null, ItemFilter(Healthpack))));

//         // Check if a lowhealth ally exists in the scene
//         let lowhealthAlly = new BasicFinder<Battler>(null, BattlerActiveFilter(), BattlerGroupFilter([owner.battleGroup]));
//         this.addStatus(HealerStatuses.ALLY_EXISTS, new TargetExists(scene.getBattlers(), lowhealthAlly));
        
//         this.addStatus(HealerStatuses.GOAL, new FalseStatus());
//         /* ######### Add all healer actions ######## */

//         // TODO configure the rest of the healer actions

//         // Idle action
//         let idle = new Idle(this, this.owner);
//         idle.addEffect(HealerStatuses.GOAL);
//         idle.cost = 100;
//         this.addState(HealerActions.IDLE, idle);

//         //pickup health
//         // An action for picking up a lasergun
//         // let pickupLaserGun = new PickupItem(this, this.owner);
//         // pickupLaserGun.targets = scene.getLaserGuns();
//         // pickupLaserGun.targetFinder = new BasicFinder<Item>(ClosestPositioned(this.owner), VisibleItemFilter(), ItemFilter(LaserGun));
//         // pickupLaserGun.addPrecondition(GuardStatuses.LASERGUN_EXISTS);
//         // pickupLaserGun.addEffect(GuardStatuses.HAS_WEAPON);
//         // pickupLaserGun.cost = 5;
//         // this.addState(GuardActions.PICKUP_LASER_GUN, pickupLaserGun);

//         let pickup_health = new PickupItem(this, this.owner)
//         pickup_health.targets = scene.getHealthpacks()
//         pickup_health.targetFinder = new BasicFinder<Item>(ClosestPositioned(this.owner), VisibleItemFilter(), ItemFilter(Healthpack));
//         pickup_health.addPrecondition(HealerStatuses.HPACK_EXISTS);
//         pickup_health.addEffect(HealerStatuses.HAS_HPACK);
//         pickup_health.cost = 1;
//         this.addState(HealerActions.PICKUP_HPACK,pickup_health)

//         //use health
//         let use_health = new UseHealthpack(this, this.owner)
//         use_health.addEffect(HealerStatuses.GOAL)
//         use_health.cost = 5;
//         this.addState(HealerActions.USE_HPACK,use_health)

//         /* ######### Set the healers goal ######## */

//         this.goal = HealerStatuses.GOAL;
//         this.initialize();
//     }

//     public override handleEvent(event: GameEvent): void {
//         switch(event.type) {
//             default: {
//                 super.handleEvent(event);
//                 break;
//             }
//         }
//     }

//     public override update(deltaT: number): void {
//         console.log(this.currentState )
//         super.update(deltaT);
//     }

// }



export default class HealerBehavior extends NPCBehavior {

    /** The target the guard should guard */
    protected target: TargetableEntity;
    /** The range the guard should be from the target they're guarding to be considered guarding the target */
    protected range: number;

    /** Initialize the NPC AI */
    public initializeAI(owner: NPCActor, opts: Record<string, any>): void {
        super.initializeAI(owner, opts);

        // Initialize the targetable entity the guard should try to protect and the range to the target
        this.target = opts.target
        this.range = opts.range;

        // Initialize guard statuses
        this.initializeStatuses();
        // Initialize guard actions
        this.initializeActions();
        // Set the guards goal
        this.goal = HealerStatuses.GOAL;

        // Initialize the guard behavior
        this.initialize();
    }

    public handleEvent(event: GameEvent): void {
        switch(event.type) {
            default: {
                super.handleEvent(event);
                break;
            }
        }
    }

    public update(deltaT: number): void {
        // console.log(this.currentStatus() )
        // console.log(this.currentState )
        
        // let scene = this.owner.getScene();
        // let useHealth = new UseHealthpack(this, this.owner); //new UseHealthpack(this, this.owner);
        // useHealth.targets = scene.getBattlers();
        // useHealth.targetFinder = new BasicFinder<Battler>(ClosestPositioned(this.owner), BattlerActiveFilter(), CustomFilter(this.owner));
        
        // console.log(useHealth.targetFinder.find(useHealth.targets))
        super.update(deltaT);
    }

    protected initializeStatuses(): void {

        let scene = this.owner.getScene();

        // A status checking if there are any enemies at target the guard is guarding
        // let enemyBattlerFinder = new BasicFinder<Battler>(null, BattlerActiveFilter(), EnemyFilter(this.owner), RangeFilter(this.target, 0, this.range*this.range))
        // let enemyAtGuardPosition = new TargetExists(scene.getBattlers(), enemyBattlerFinder)
        // this.addStatus(GuardStatuses.ENEMY_IN_GUARD_POSITION, enemyAtGuardPosition);

        this.addStatus(HealerStatuses.HPACK_EXISTS, new TargetExists(scene.getHealthpacks(), new BasicFinder<Item>(null, ItemFilter(Healthpack), VisibleItemFilter())));
        
        // Add a status to check if the guard has a lasergun
        this.addStatus(HealerStatuses.HAS_HPACK, new HasItem(this.owner, new BasicFinder<Item>(null, ItemFilter(Healthpack))));

        // Check if a lowhealth ally exists in the scene
        let lowhealthAlly = new BasicFinder<Battler>(null, BattlerActiveFilter(), CustomFilter(this.owner));
        this.addStatus(HealerStatuses.ALLY_EXISTS, new TargetExists(scene.getBattlers(), lowhealthAlly));


        // let enemyBattlerFinder = new BasicFinder<Battler>(null, BattlerActiveFilter(), EnemyFilter(this.owner), RangeFilter(this.target, 0, this.range*this.range))
        // let enemyAtGuardPosition = new TargetExists(scene.getBattlers(), enemyBattlerFinder)
        // this.addStatus(HealerStatuses.ENEMY_IN_GUARD_POSITION, enemyAtGuardPosition);

        // this.addStatus(HealerStatuses.LASERGUN_EXISTS, new TargetExists(scene.getLaserGuns(), new BasicFinder<Item>(null, ItemFilter(LaserGun), VisibleItemFilter())));
        // // Add a status to check if the guard has a lasergun
        // this.addStatus(HealerStatuses.HAS_WEAPON, new HasItem(this.owner, new BasicFinder(null, ItemFilter(LaserGun))));


        // Add the goal status 
        this.addStatus(HealerStatuses.GOAL, new FalseStatus());
    }

    protected initializeActions(): void {

        let scene = this.owner.getScene();


        // let shootEnemy = new ShootLaserGun(this, this.owner);
        // shootEnemy.targets = scene.getBattlers();
        // shootEnemy.targetFinder = new BasicFinder<Battler>(ClosestPositioned(this.owner), BattlerActiveFilter(), BattlerGroupFilter([this.owner.battleGroup]), RangeFilter(this.target, 0, this.range*this.range));
        // shootEnemy.addPrecondition(HealerStatuses.HAS_WEAPON);
        // shootEnemy.addPrecondition(HealerStatuses.ENEMY_IN_GUARD_POSITION);
        // shootEnemy.addEffect(HealerStatuses.GOAL);
        // shootEnemy.cost = 1;
        // this.addState(HealerActions.SHOOT_ENEMY, shootEnemy);

        // An action for picking up a lasergun
        // let pickupLaserGun = new PickupItem(this, this.owner);
        // pickupLaserGun.targets = scene.getLaserGuns();
        // pickupLaserGun.targetFinder = new BasicFinder<Item>(ClosestPositioned(this.owner), VisibleItemFilter(), ItemFilter(LaserGun));
        // pickupLaserGun.addPrecondition(HealerStatuses.LASERGUN_EXISTS);
        // pickupLaserGun.addEffect(HealerStatuses.HAS_WEAPON);
        // pickupLaserGun.cost = 5;
        // this.addState(HealerActions.PICKUP_LASER_GUN, pickupLaserGun);

        // // An action for guarding the guard's guard location
        // let guard = new Idle(this, this.owner);
        // guard.targets = [this.target];
        // guard.targetFinder = new BasicFinder();
        // guard.addPrecondition(HealerStatuses.HAS_WEAPON);
        // guard.addEffect(HealerStatuses.GOAL);
        // guard.cost = 1000;
        // this.addState(HealerActions.GUARD, guard);


        let useHealth = new UseHealthpack(this, this.owner); //new UseHealthpack(this, this.owner);
        useHealth.targets = scene.getBattlers();
        useHealth.targetFinder = new BasicFinder<Battler>(ClosestPositioned(this.owner), BattlerActiveFilter(), CustomFilter(this.owner));
        useHealth.addPrecondition(HealerStatuses.HAS_HPACK);
        useHealth.addPrecondition(HealerStatuses.ALLY_EXISTS);
        useHealth.addEffect(HealerStatuses.GOAL);
        useHealth.cost = 1;
        this.addState(HealerActions.USE_HPACK, useHealth);



        let pickupHealth = new PickupItem(this, this.owner);
        pickupHealth.targets = scene.getHealthpacks();
        pickupHealth.targetFinder = new BasicFinder<Item>(ClosestPositioned(this.owner), VisibleItemFilter(), ItemFilter(Healthpack));
        pickupHealth.addPrecondition(HealerStatuses.HPACK_EXISTS);
        pickupHealth.addEffect(HealerStatuses.HAS_HPACK);
        pickupHealth.cost = 5;
        this.addState(HealerActions.PICKUP_HPACK, pickupHealth);

        // let guard = new Idle(this, this.owner);
        // guard.targets = [this.target];
        // guard.targetFinder = new BasicFinder();
        // guard.addPrecondition(GuardStatuses.HAS_WEAPON);
        // guard.addEffect(GuardStatuses.GOAL);
        // guard.cost = 1000;
        // this.addState(GuardActions.GUARD, guard);

        let idle = new Idle(this, this.owner);
        idle.targets = [this.target];
        idle.targetFinder = new BasicFinder();
        // idle.addPrecondition(HealerStatuses.HAS_HPACK);
        idle.addEffect(HealerStatuses.GOAL);
        idle.cost = 1000;
        this.addState(HealerActions.IDLE, idle);
    }

    public override addState(stateName: HealerAction, state: GoapAction): void {
        super.addState(stateName, state);
    }

    public override addStatus(statusName: HealerStatus, status: GoapState): void {
        super.addStatus(statusName, status);
    }
}


export type HealerStatus = typeof HealerStatuses[keyof typeof HealerStatuses];
export const HealerStatuses = {

    ENEMY_IN_GUARD_POSITION: "enemy-at-guard-position",

    HAS_WEAPON: "has-weapon",

    LASERGUN_EXISTS: "laser-gun-exists",

    // Whether or not a healthpack exists in the world
    HPACK_EXISTS: "hpack-exists",

    // Whether the healer has a healthpack in their inventory or not
    ALLY_EXISTS: "ally-exists",

    // Whether the healer has any allies in the game world or not
    HAS_HPACK: "has-hpack",

    // Whether the healer has reached it's goal or not
    GOAL: "goal"

} as const;

export type HealerAction = typeof HealerActions[keyof typeof HealerActions];
export const HealerActions = {

    PICKUP_LASER_GUN: "pickup-lasergun",

    SHOOT_ENEMY: "shoot-enemy",

    GUARD: "guard",

    PICKUP_HPACK: "pickup-hpack",

    USE_HPACK: "use-hpack",

    IDLE: "idle",

} as const;
