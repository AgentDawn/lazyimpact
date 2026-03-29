package chainbreaker

import (
	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
	"lazyimpact/gcsim/pkg/modifier"
)

func init() {
	core.RegisterWeaponFunc(keys.ChainBreaker, NewWeapon)
}

type Weapon struct {
	Index    int
	c        *core.Core
	self     *character.CharWrapper
	atkStack float64
	emBuff   float64
}

func (w *Weapon) SetIndex(idx int) { w.Index = idx }

// For every party member from Natlan
// or who has a different Elemental Type from the equipping character,
// the equipping character gains 4.8% increased ATK.
// When there are no less than 3 of the aforementioned characters,
// the equipping character gains 24 Elemental Mastery.
func (w *Weapon) Init() error {
	stacks := 0
	for _, char := range w.c.Player.Chars() {
		if char.Base.Element != w.self.Base.Element || char.CharZone == info.ZoneNatlan {
			stacks++
		}
	}

	mAtk := make([]float64, attributes.EndStatType)
	mAtk[attributes.ATKP] = w.atkStack * float64(stacks)
	w.self.AddStatMod(character.StatMod{
		Base:         modifier.NewBase("chain-breaker-atk", -1),
		AffectedStat: attributes.ATKP,
		Amount: func() []float64 {
			return mAtk
		},
	})

	if stacks >= 3 {
		mEm := make([]float64, attributes.EndStatType)
		mEm[attributes.EM] = float64(w.emBuff)
		w.self.AddStatMod(character.StatMod{
			Base:         modifier.NewBase("chain-breaker-em", -1),
			AffectedStat: attributes.EM,
			Amount: func() []float64 {
				return mEm
			},
		})
	}

	return nil
}

func NewWeapon(c *core.Core, char *character.CharWrapper, p info.WeaponProfile) (info.Weapon, error) {
	w := &Weapon{
		c:    c,
		self: char,
	}
	r := p.Refine

	w.atkStack = 0.036 + float64(r)*0.012
	w.emBuff = 18 + float64(r)*6

	return w, nil
}
