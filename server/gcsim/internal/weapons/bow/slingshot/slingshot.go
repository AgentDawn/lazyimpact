package slingshot

import (
	"slices"

	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/attacks"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
	"lazyimpact/gcsim/pkg/modifier"
)

func init() {
	core.RegisterWeaponFunc(keys.Slingshot, NewWeapon)
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

	incrDmg := .3 + float64(r)*0.06
	decrDmg := -0.10
	passiveThresholdF := 18
	travel := 0
	char.AddAttackMod(character.AttackMod{
		Base: modifier.NewBase("slingshot", -1),
		Amount: func(atk *info.AttackEvent, t info.Target) []float64 {
			if (atk.Info.AttackTag != attacks.AttackTagNormal) && (atk.Info.AttackTag != attacks.AttackTagExtra) {
				return nil
			}
			active := c.Player.ByIndex(atk.Info.ActorIndex)
			if active.Base.Key == keys.Tartaglia &&
				atk.Info.StrikeType == attacks.StrikeTypeSlash {
				return nil
			}

			// chasca E/A4 bullets and C2/C4 Aoe don't count
			if char.Base.Key == keys.Chasca && slices.Contains(atk.Info.AdditionalTags, attacks.AdditionalTagNightsoul) {
				return nil
			}

			travel = c.F - atk.Snapshot.SourceFrame
			m[attributes.DmgP] = incrDmg
			if travel > passiveThresholdF {
				m[attributes.DmgP] = decrDmg
			}
			return m
		},
	})

	return w, nil
}
