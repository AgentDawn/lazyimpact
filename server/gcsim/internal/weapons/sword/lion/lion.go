package lion

import (
	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/attacks"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
	"lazyimpact/gcsim/pkg/enemy"
	"lazyimpact/gcsim/pkg/modifier"
)

func init() {
	core.RegisterWeaponFunc(keys.LionsRoar, NewWeapon)
}

// Increases DMG against enemies affected by Hydro or Electro by 20/24/28/32/36%.
type Weapon struct {
	Index int
}

func (w *Weapon) SetIndex(idx int) { w.Index = idx }
func (w *Weapon) Init() error      { return nil }

func NewWeapon(c *core.Core, char *character.CharWrapper, p info.WeaponProfile) (info.Weapon, error) {
	w := &Weapon{}
	r := p.Refine

	m := make([]float64, attributes.EndStatType)
	m[attributes.DmgP] = 0.16 + float64(r)*0.04

	char.AddAttackMod(character.AttackMod{
		Base: modifier.NewBase("lionsroar", -1),
		Amount: func(atk *info.AttackEvent, t info.Target) []float64 {
			if atk.Info.AttackTag > attacks.ReactionAttackStartDelim {
				return nil
			}
			x, ok := t.(*enemy.Enemy)
			if !ok {
				return nil
			}
			if x.AuraContains(attributes.Electro, attributes.Pyro) {
				return m
			}
			return nil
		},
	})

	return w, nil
}
