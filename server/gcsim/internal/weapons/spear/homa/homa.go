package homa

import (
	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
	"lazyimpact/gcsim/pkg/modifier"
)

func init() {
	core.RegisterWeaponFunc(keys.StaffOfHoma, NewWeapon)
}

type Weapon struct {
	Index int
}

func (w *Weapon) SetIndex(idx int) { w.Index = idx }
func (w *Weapon) Init() error      { return nil }

func NewWeapon(c *core.Core, char *character.CharWrapper, p info.WeaponProfile) (info.Weapon, error) {
	w := &Weapon{}
	r := p.Refine

	mHP := make([]float64, attributes.EndStatType)
	mHP[attributes.HPP] = 0.15 + float64(r)*0.05
	char.AddStatMod(character.StatMod{
		Base:         modifier.NewBase("homa-hp", -1),
		AffectedStat: attributes.NoStat,
		Amount: func() []float64 {
			return mHP
		},
	})

	mATK := make([]float64, attributes.EndStatType)
	atkp := 0.006 + float64(r)*0.002
	lowhp := 0.008 + float64(r)*0.002
	char.AddStatMod(character.StatMod{
		Base:         modifier.NewBase("homa-atk-buff", -1),
		AffectedStat: attributes.ATK,
		Extra:        true,
		Amount: func() []float64 {
			maxhp := char.MaxHP()
			per := atkp
			if char.CurrentHPRatio() <= 0.5 {
				per += lowhp
			}
			mATK[attributes.ATK] = per * maxhp
			return mATK
		},
	})

	return w, nil
}
