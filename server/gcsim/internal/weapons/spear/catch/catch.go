package catch

import (
	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/attacks"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
	"lazyimpact/gcsim/pkg/modifier"
)

func init() {
	core.RegisterWeaponFunc(keys.TheCatch, NewWeapon)
}

type Weapon struct {
	Index int
}

func (w *Weapon) SetIndex(idx int) { w.Index = idx }
func (w *Weapon) Init() error      { return nil }

func NewWeapon(c *core.Core, char *character.CharWrapper, p info.WeaponProfile) (info.Weapon, error) {
	w := &Weapon{}
	r := p.Refine

	val := make([]float64, attributes.EndStatType)
	val[attributes.DmgP] = 0.12 + 0.04*float64(r)
	val[attributes.CR] = 0.045 + 0.015*float64(r)
	char.AddAttackMod(character.AttackMod{
		Base: modifier.NewBase("the-catch", -1),
		Amount: func(atk *info.AttackEvent, t info.Target) []float64 {
			if atk.Info.AttackTag == attacks.AttackTagElementalBurst {
				return val
			}
			return nil
		},
	})

	return w, nil
}
