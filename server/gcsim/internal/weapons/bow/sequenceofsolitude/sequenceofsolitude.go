package sequenceofsolitude

import (
	"fmt"

	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/attacks"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/combat"
	"lazyimpact/gcsim/pkg/core/event"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
	"lazyimpact/gcsim/pkg/enemy"
)

const icdKey = "sequence-of-solitude-icd"

func init() {
	core.RegisterWeaponFunc(keys.SequenceOfSolitude, NewWeapon)
}

type Weapon struct {
	Index int
}

func (w *Weapon) SetIndex(idx int) { w.Index = idx }
func (w *Weapon) Init() error      { return nil }

func NewWeapon(c *core.Core, char *character.CharWrapper, p info.WeaponProfile) (info.Weapon, error) {
	w := &Weapon{}
	r := p.Refine

	hp := 0.3 + float64(r)*0.1

	c.Events.Subscribe(event.OnEnemyDamage, func(args ...any) {
		t, ok := args[0].(*enemy.Enemy)
		if !ok {
			return
		}
		ae := args[1].(*info.AttackEvent)
		if ae.Info.ActorIndex != char.Index() {
			return
		}
		if c.Player.Active() != char.Index() {
			return
		}
		if char.StatusIsActive(icdKey) {
			return
		}
		char.AddStatus(icdKey, 15*60, true)
		ai := info.AttackInfo{
			ActorIndex: char.Index(),
			Abil:       "Sequence of Solitude Proc",
			AttackTag:  attacks.AttackTagWeaponSkill,
			ICDTag:     attacks.ICDTagNone,
			ICDGroup:   attacks.ICDGroupDefault,
			StrikeType: attacks.StrikeTypeDefault,
			Element:    attributes.Physical,
			Durability: 100,
			FlatDmg:    char.MaxHP() * hp,
		}
		c.QueueAttack(ai, combat.NewCircleHitOnTarget(t, nil, 3), 0, 1)
	}, fmt.Sprintf("solitude-%v", char.Base.Key.String()))
	return w, nil
}
