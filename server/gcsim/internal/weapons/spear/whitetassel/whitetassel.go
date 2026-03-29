package whitetassel

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
	core.RegisterWeaponFunc(keys.WhiteTassel, NewWeapon)
}

// Increases Normal Attack DMG by 24/30/36/42/48%.
type Weapon struct {
	Index int
}

func (w *Weapon) SetIndex(idx int) { w.Index = idx }
func (w *Weapon) Init() error      { return nil }

func NewWeapon(c *core.Core, char *character.CharWrapper, p info.WeaponProfile) (info.Weapon, error) {
	w := &Weapon{}
	r := p.Refine

	m := make([]float64, attributes.EndStatType)
	m[attributes.DmgP] = 0.18 + 0.06*float64(r)
	char.AddAttackMod(character.AttackMod{
		Base: modifier.NewBase("whitetassel", -1),
		Amount: func(atk *info.AttackEvent, t info.Target) []float64 {
			if atk.Info.AttackTag == attacks.AttackTagNormal {
				return m
			}
			return nil
		},
	})

	return w, nil
}
