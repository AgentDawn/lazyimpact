package travelershandysword

import (
	"fmt"

	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/event"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
)

func init() {
	core.RegisterWeaponFunc(keys.TravelersHandySword, NewWeapon)
}

// Each Elemental Orb or Particle collected restores 1/1.25/1.5/1.75/2% HP.
type Weapon struct {
	Index int
}

func (w *Weapon) SetIndex(idx int) { w.Index = idx }
func (w *Weapon) Init() error      { return nil }

func NewWeapon(c *core.Core, char *character.CharWrapper, p info.WeaponProfile) (info.Weapon, error) {
	w := &Weapon{}
	r := p.Refine

	c.Events.Subscribe(event.OnParticleReceived, func(args ...any) {
		// ignore if character not on field
		if c.Player.Active() != char.Index() {
			return
		}
		c.Player.Heal(info.HealInfo{
			Type:    info.HealTypePercent,
			Message: "Traveler's Handy Sword (Proc)",
			Src:     0.0075 + float64(r)*0.0025,
		})
	}, fmt.Sprintf("travelershandysword-%v", char.Base.Key.String()))

	return w, nil
}
