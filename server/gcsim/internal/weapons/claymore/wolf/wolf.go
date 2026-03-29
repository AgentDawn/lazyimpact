package wolf

import (
	"fmt"

	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/event"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
	"lazyimpact/gcsim/pkg/enemy"
	"lazyimpact/gcsim/pkg/modifier"
)

func init() {
	core.RegisterWeaponFunc(keys.WolfsGravestone, NewWeapon)
}

type Weapon struct {
	Index int
}

func (w *Weapon) SetIndex(idx int) { w.Index = idx }
func (w *Weapon) Init() error      { return nil }

func NewWeapon(c *core.Core, char *character.CharWrapper, p info.WeaponProfile) (info.Weapon, error) {
	// Increases ATK by 20%. On hit, attacks against opponents with less than 30%
	// HP increase all party members' ATK by 40% for 12s. Can only occur once
	// every 30s.
	w := &Weapon{}
	r := p.Refine

	// flat atk% increase
	val := make([]float64, attributes.EndStatType)
	val[attributes.ATKP] = 0.15 + 0.05*float64(r)
	char.AddStatMod(character.StatMod{
		Base:         modifier.NewBase("wolf-flat", -1),
		AffectedStat: attributes.NoStat,
		Amount: func() []float64 {
			return val
		},
	})

	// under hp increase
	bonus := make([]float64, attributes.EndStatType)
	bonus[attributes.ATKP] = 0.3 + 0.1*float64(r)
	const icdKey = "wolf-gravestone-icd"

	c.Events.Subscribe(event.OnEnemyDamage, func(args ...any) {
		if !c.Flags.DamageMode {
			return
		}

		atk := args[1].(*info.AttackEvent)
		t, ok := args[0].(*enemy.Enemy)
		if !ok {
			return
		}
		if atk.Info.ActorIndex != char.Index() {
			return
		}
		if c.Player.Active() != char.Index() {
			return
		}
		if char.StatusIsActive(icdKey) {
			return
		}

		if t.HP()/t.MaxHP() > 0.3 {
			return
		}
		char.AddStatus(icdKey, 1800, true)

		for _, char := range c.Player.Chars() {
			char.AddStatMod(character.StatMod{
				Base:         modifier.NewBaseWithHitlag("wolf-proc", 720),
				AffectedStat: attributes.NoStat,
				Amount: func() []float64 {
					return bonus
				},
			})
		}
	}, fmt.Sprintf("wolf-%v", char.Base.Key.String()))
	return w, nil
}
