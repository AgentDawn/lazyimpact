package skyrider

import (
	"fmt"

	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/event"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
	"lazyimpact/gcsim/pkg/modifier"
)

func init() {
	core.RegisterWeaponFunc(keys.SkyriderSword, NewWeapon)
}

type Weapon struct {
	Index int
}

func (w *Weapon) SetIndex(idx int) { w.Index = idx }
func (w *Weapon) Init() error      { return nil }

// Using an Elemental Burst grants a 12% increase in ATK and Movement SPD for 15s.
func NewWeapon(c *core.Core, char *character.CharWrapper, p info.WeaponProfile) (info.Weapon, error) {
	w := &Weapon{}
	r := p.Refine

	val := make([]float64, attributes.EndStatType)
	val[attributes.ATKP] = 0.09 + 0.03*float64(r)

	// TODO: this used to be on post. make sure nothing broke here
	c.Events.Subscribe(event.OnBurst, func(args ...any) {
		if c.Player.Active() != char.Index() {
			return
		}
		char.AddStatMod(character.StatMod{
			Base:         modifier.NewBaseWithHitlag("skyrider", 900),
			AffectedStat: attributes.NoStat,
			Amount: func() []float64 {
				return val
			},
		})
	}, fmt.Sprintf("skyrider-sword-%v", char.Base.Key.String()))

	return w, nil
}
