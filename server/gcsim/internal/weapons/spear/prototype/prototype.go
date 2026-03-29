package prototype

import (
	"fmt"

	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/attacks"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/event"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
	"lazyimpact/gcsim/pkg/modifier"
)

func init() {
	core.RegisterWeaponFunc(keys.PrototypeStarglitter, NewWeapon)
}

type Weapon struct {
	Index  int
	buff   []float64
	stacks int
}

func (w *Weapon) SetIndex(idx int) { w.Index = idx }
func (w *Weapon) Init() error      { return nil }

// After using an Elemental Skill, increases Normal and Charged Attack DMG by 8% for 12s. Max 2 stacks.
func NewWeapon(c *core.Core, char *character.CharWrapper, p info.WeaponProfile) (info.Weapon, error) {
	w := &Weapon{}
	r := p.Refine
	const buffKey = "prototype"

	// no icd on this one
	w.buff = make([]float64, attributes.EndStatType)
	atkbonus := 0.06 + 0.02*float64(r)
	// add on crit effect
	c.Events.Subscribe(event.OnSkill, func(args ...any) {
		if c.Player.Active() != char.Index() {
			return
		}
		if !char.StatusIsActive(buffKey) {
			w.stacks = 0
		}
		if w.stacks < 2 {
			w.stacks++
			w.buff[attributes.ATKP] = atkbonus * float64(w.stacks)
		}
		char.AddAttackMod(character.AttackMod{
			Base: modifier.NewBaseWithHitlag(buffKey, 720),
			Amount: func(atk *info.AttackEvent, t info.Target) []float64 {
				if atk.Info.AttackTag != attacks.AttackTagNormal && atk.Info.AttackTag != attacks.AttackTagExtra {
					return nil
				}
				return w.buff
			},
		})
	}, fmt.Sprintf("prototype-starglitter-%v", char.Base.Key.String()))

	return w, nil
}
