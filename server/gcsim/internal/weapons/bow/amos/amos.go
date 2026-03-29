package amos

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
	core.RegisterWeaponFunc(keys.AmosBow, NewWeapon)
}

type Weapon struct {
	Index int
}

func (w *Weapon) SetIndex(idx int) { w.Index = idx }
func (w *Weapon) Init() error      { return nil }

func NewWeapon(c *core.Core, char *character.CharWrapper, p info.WeaponProfile) (info.Weapon, error) {
	w := &Weapon{}
	r := p.Refine

	dmgpers := 0.06 + 0.02*float64(r)

	m := make([]float64, attributes.EndStatType)
	// m[attributes.DmgP] = 0.09 + 0.03*float64(r)
	flat := 0.09 + 0.03*float64(r)

	char.AddAttackMod(character.AttackMod{
		Base: modifier.NewBase("amos", -1),
		Amount: func(atk *info.AttackEvent, t info.Target) []float64 {
			if atk.Info.AttackTag != attacks.AttackTagNormal && atk.Info.AttackTag != attacks.AttackTagExtra {
				return nil
			}
			m[attributes.DmgP] = flat
			travel := float64(c.F-atk.Snapshot.SourceFrame) / 60
			stacks := min(int(travel/0.1), 5)
			m[attributes.DmgP] += dmgpers * float64(stacks)
			return m
		},
	})

	return w, nil
}
