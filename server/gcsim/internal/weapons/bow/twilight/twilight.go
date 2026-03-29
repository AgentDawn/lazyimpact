package twilight

import (
	"fmt"

	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/event"
	"lazyimpact/gcsim/pkg/core/glog"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
	"lazyimpact/gcsim/pkg/modifier"
)

func init() {
	core.RegisterWeaponFunc(keys.FadingTwilight, NewWeapon)
}

type Weapon struct {
	Index int
}

func (w *Weapon) SetIndex(idx int) { w.Index = idx }
func (w *Weapon) Init() error      { return nil }

func NewWeapon(c *core.Core, char *character.CharWrapper, p info.WeaponProfile) (info.Weapon, error) {
	w := &Weapon{}
	r := p.Refine

	m := make([]float64, attributes.EndStatType)
	cycle := 0
	base := 0.0

	m[attributes.DmgP] = base
	char.AddAttackMod(character.AttackMod{
		Base: modifier.NewBase("twilight-bonus-dmg", -1),
		Amount: func(atk *info.AttackEvent, t info.Target) []float64 {
			switch cycle {
			case 2:
				base = 0.105 + float64(r)*0.035
			case 1:
				base = 0.075 + float64(r)*0.025
			default:
				base = 0.045 + float64(r)*0.015
			}

			m[attributes.DmgP] = base
			return m
		},
	})

	const icdKey = "twilight-icd"
	icd := 420
	c.Events.Subscribe(event.OnEnemyDamage, func(args ...any) {
		atk := args[1].(*info.AttackEvent)
		if atk.Info.ActorIndex != char.Index() {
			return
		}

		if char.StatusIsActive(icdKey) {
			return
		}
		char.AddStatus(icdKey, icd, true)
		cycle++
		cycle %= 3
		c.Log.NewEvent("fading twillight cycle changed", glog.LogWeaponEvent, char.Index()).
			Write("cycle", cycle).
			Write("next cycle (without hitlag)", c.F+icd)
	}, fmt.Sprintf("fadingtwilight-%v", char.Base.Key.String()))

	return w, nil
}
