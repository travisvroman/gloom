namespace FPS {

    export interface ITriggerable extends IEntity, IDestroyable {

        Trigger( trigger: Trigger ): boolean;
    }
}