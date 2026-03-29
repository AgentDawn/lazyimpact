package festering

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
	core.RegisterWeaponFunc(keys.FesteringDesire, NewWeapon)
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
	m[attributes.CR] = .045 + .015*float64(r)
	m[attributes.DmgP] = .12 + 0.04*float64(r)
	char.AddAttackMod(character.AttackMod{
		Base: modifier.NewBase("festering", -1),
		Amount: func(atk *info.AttackEvent, t info.Target) []float64 {
			switch atk.Info.AttackTag {
			case attacks.AttackTagElementalArt, attacks.AttackTagElementalArtHold:
				return m
			}
			return nil
		},
	})

	return w, nil
}
