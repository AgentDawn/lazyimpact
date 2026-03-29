package blacksword

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
	core.RegisterWeaponFunc(keys.TheBlackSword, NewWeapon)
}

// Increases DMG dealt by Normal and Charged Attacks by 20%. Additionally,
// regenerates 60% of ATK as HP when Normal and Charged Attacks score a CRIT Hit. This effect can occur once every 5s.
type Weapon struct {
	Index int
}

func (w *Weapon) SetIndex(idx int) { w.Index = idx }
func (w *Weapon) Init() error      { return nil }

func NewWeapon(c *core.Core, char *character.CharWrapper, p info.WeaponProfile) (info.Weapon, error) {
	w := &Weapon{}
	r := p.Refine

	val := make([]float64, attributes.EndStatType)
	val[attributes.DmgP] = 0.15 + 0.05*float64(r)
	char.AddAttackMod(character.AttackMod{
		Base: modifier.NewBase("blacksword", -1),
		Amount: func(atk *info.AttackEvent, t info.Target) []float64 {
			if atk.Info.AttackTag != attacks.AttackTagNormal && atk.Info.AttackTag != attacks.AttackTagExtra {
				return nil
			}
			return val
		},
	})

	const icdKey = "black-sword-icd"
	heal := 0.5 + .1*float64(r)
	c.Events.Subscribe(event.OnEnemyDamage, func(args ...any) {
		atk := args[1].(*info.AttackEvent)
		crit := args[3].(bool)
		if atk.Info.ActorIndex != char.Index() {
			return
		}
		if atk.Info.AttackTag != attacks.AttackTagNormal && atk.Info.AttackTag != attacks.AttackTagExtra {
			return
		}
		if c.Player.Active() != char.Index() {
			return
		}
		if char.StatusIsActive(icdKey) {
			return
		}
		if crit {
			c.Player.Heal(info.HealInfo{
				Caller:  char.Index(),
				Target:  c.Player.Active(),
				Message: "The Black Sword",
				Src:     heal * atk.Snapshot.Stats.TotalATK(),
				Bonus:   char.Stat(attributes.Heal),
			})
			// trigger cd
			char.AddStatus(icdKey, 300, true) // every 5s
		}
	}, fmt.Sprintf("black-sword-%v", char.Base.Key.String()))
	return w, nil
}
