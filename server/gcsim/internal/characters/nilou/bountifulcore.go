package nilou

import (
	"lazyimpact/gcsim/internal/template/dendrocore"
	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/attacks"
	"lazyimpact/gcsim/pkg/core/combat"
	"lazyimpact/gcsim/pkg/core/event"
	"lazyimpact/gcsim/pkg/core/glog"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/gadget"
)

type BountifulCore struct {
	srcFrame int
	*gadget.Gadget
}

func newBountifulCore(c *core.Core, p info.Point, a *info.AttackEvent) *BountifulCore {
	b := &BountifulCore{
		srcFrame: c.F,
	}

	b.Gadget = gadget.New(c, p, 2, info.GadgetTypDendroCore)
	b.Duration = 0.4 * 60

	char := b.Core.Player.ByIndex(a.Info.ActorIndex)
	explode := func() {
		c.Tasks.Add(func() {
			ai, snap := dendrocore.NewBloomAttack(char, b, func(atk *info.AttackInfo) {
				// atk.Abil += " (bountiful core)"
				// FIXME: some external code only match against AttackTagBloom. fix A4 if you uncomment this
				// atk.AttackTag = attacks.AttackTagBountifulCore
				atk.ICDTag = attacks.ICDTagBountifulCoreDamage
			})
			ap := combat.NewCircleHitOnTarget(b.Gadget, nil, 6.5)
			c.QueueAttackWithSnap(ai, snap, ap, 0)

			// self damage
			ai.Abil += info.SelfDamageSuffix
			ai.FlatDmg = 0.05 * ai.FlatDmg
			ap.SkipTargets[info.TargettablePlayer] = false
			ap.SkipTargets[info.TargettableEnemy] = true
			ap.SkipTargets[info.TargettableGadget] = true
			c.QueueAttackWithSnap(ai, snap, ap, 0)
		}, 1)
	}
	b.OnExpiry = explode
	b.OnKill = explode

	return b
}

func (b *BountifulCore) Tick() {
	// this is needed since gadget tick
	b.Gadget.Tick()
}

func (b *BountifulCore) HandleAttack(atk *info.AttackEvent) float64 {
	b.Core.Events.Emit(event.OnGadgetHit, b, atk)
	return 0
}
func (b *BountifulCore) Attack(*info.AttackEvent, glog.Event) (float64, bool) { return 0, false }
func (b *BountifulCore) SetDirection(trg info.Point)                          {}
func (b *BountifulCore) SetDirectionToClosestEnemy()                          {}
func (b *BountifulCore) CalcTempDirection(trg info.Point) info.Point {
	return info.DefaultDirection()
}
