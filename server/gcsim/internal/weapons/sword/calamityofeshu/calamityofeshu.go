package calamityofeshu

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
	core.RegisterWeaponFunc(keys.CalamityOfEshu, NewWeapon)
}

type Weapon struct {
	Index int
}

func (w *Weapon) SetIndex(idx int) { w.Index = idx }
func (w *Weapon) Init() error      { return nil }

func NewWeapon(c *core.Core, char *character.CharWrapper, p info.WeaponProfile) (info.Weapon, error) {
	w := &Weapon{}
	r := float64(p.Refine)

	m := make([]float64, attributes.EndStatType)
	m[attributes.DmgP] = 0.15 + 0.05*r
	m[attributes.CR] = 0.06 + 0.02*r
	char.AddAttackMod(character.AttackMod{
		Base: modifier.NewBase("calamityofeshu", -1),
		Amount: func(atk *info.AttackEvent, t info.Target) []float64 {
			if !c.Player.Shields.CharacterIsShielded(char.Index(), c.Player.Active()) {
				return nil
			}
			if atk.Info.AttackTag != attacks.AttackTagNormal && atk.Info.AttackTag != attacks.AttackTagExtra {
				return nil
			}
			return m
		},
	})

	return w, nil
}
