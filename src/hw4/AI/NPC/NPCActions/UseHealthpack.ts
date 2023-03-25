import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import Battler from "../../../GameSystems/BattleSystem/Battler";
import Healthpack from "../../../GameSystems/ItemSystem/Items/Healthpack";
import { TargetableEntity } from "../../../GameSystems/Targeting/TargetableEntity";
import NPCActor from "../../../Actors/NPCActor";
import NPCBehavior from "../NPCBehavior";
import NPCAction from "./NPCAction";
import Finder from "../../../GameSystems/Searching/Finder";
import { ItemEvent } from "../../../Events";


export default class UseHealthpack extends NPCAction {
    
    // The targeting strategy used for this GotoAction - determines how the target is selected basically
    protected override _targetFinder: Finder<Battler>;
    // The targets or Targetable entities 
    protected override _targets: Battler[];
    // The target we are going to set the actor to target
    protected override _target: Battler | null;


    protected hpack: Healthpack | null;
    
    public constructor(parent: NPCBehavior, actor: NPCActor) {
        super(parent, actor);
        this.hpack = null;
        this._target = null;
    }

    public performAction(target: Battler): void {
        // console.log("wwwwwwwwwwwwwwwwww")
        // if(target.health < target.maxHealth){
        if(this.hpack !== null){
            target.health += this.hpack.health
            this.emitter.fireEvent(ItemEvent.CONSUMABLE_USED,{
                actorId: this.actor.id,
                to: target
            })
            this.finished()
        }
        
        // }
    }

    public onEnter(options: Record<string, any>): void {
        // console.log("zzzzzzzzzzzzzzzzzzzz")
        super.onEnter(options);
        // Find a lasergun in the actors inventory
        let hpack = this.actor.inventory.find(item => item.constructor === Healthpack);
        if (hpack !== null && hpack.constructor === Healthpack) {
            this.hpack = hpack;
        }
    }

    public handleInput(event: GameEvent): void {
        switch(event.type) {
            default: {
                super.handleInput(event);
                break;
            }
        }
    }

    public update(deltaT: number): void {
        super.update(deltaT);
    }

    public onExit(): Record<string, any> {
        // console.log("bbbbbbbbbbbbbbbbb")
        if(this.hpack != null){
            this.actor.inventory.remove(this.hpack.id)
        }
        
        return super.onExit();
    }

    public get targetFinder(): Finder<Battler> { return this._targetFinder; }
    public set targetFinder(finder: Finder<Battler>) { this._targetFinder = finder; }

    public get targets(): Array<Battler> { return this._targets; }
    public set targets(targets: Array<Battler>) { this._targets = targets; }

    public get target(): Battler | null { return this._target; }
    protected set target(target: Battler | null) { this._target = target; }

}