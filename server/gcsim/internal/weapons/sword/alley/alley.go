package alley

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
	core.RegisterWeaponFunc(keys.TheAlleyFlash, NewWeapon)
}

type Weapon struct {
	Index int
	c     *core.Core
	char  *character.CharWrapper
}

const lockoutKey = "alley-flash-lockout"

func (w *Weapon) SetIndex(idx int) { w.Index = idx }
func (w *Weapon) Init() error      { return nil }

func NewWeapon(c *core.Core, char *character.CharWrapper, p info.WeaponProfile) (info.Weapon, error) {
	w := &Weapon{
		c:    c,
		char: char,
	}
	r := p.Refine

	c.Events.Subscribe(event.OnPlayerHPDrain, func(args ...any) {
		di := args[0].(*info.DrainInfo)
		if di.ActorIndex != char.Index() {
			return
		}
		if di.Amount <= 0 {
			return
		}
		if !di.External {
			return
		}
		w.char.AddStatus(lockoutKey, 300, true)
	}, fmt.Sprintf("alleyflash-%v", char.Base.Key.String()))

	m := make([]float64, attributes.EndStatType)
	m[attributes.DmgP] = 0.09 + 0.03*float64(r)
	char.AddStatMod(character.StatMod{
		Base:         modifier.NewBase("alleyflash", -1),
		AffectedStat: attributes.NoStat,
		Amount: func() []float64 {
			if char.StatusIsActive(lockoutKey) {
				return nil
			}
			return m
		},
	})

	return w, nil
}
