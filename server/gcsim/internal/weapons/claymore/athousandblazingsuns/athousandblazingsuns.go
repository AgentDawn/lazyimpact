package athousandblazingsuns

import (
	"fmt"

	"lazyimpact/gcsim/internal/template/nightsoul"
	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/attacks"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/event"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
	"lazyimpact/gcsim/pkg/modifier"
)

const (
	BuffICDKey   = "athousandblazingsuns-buff-icd"
	ExtendICDKey = "athousandblazingsuns-extend-icd"
	BuffKey      = "athousandblazingsuns-buff"
	BuffICDDur   = 10 * 60
	ExtendICDDur = 60
	BuffDur      = 6 * 60
	ExtendDur    = 2 * 60
)

func init() {
	core.RegisterWeaponFunc(keys.AThousandBlazingSuns, NewWeapon)
}

type Weapon struct {
	Index int
	core  *core.Core
	char  *character.CharWrapper

	extended int
	tickSrc  int
}

func (w *Weapon) SetIndex(idx int) { w.Index = idx }
func (w *Weapon) Init() error      { return nil }

func (w *Weapon) extendOffField(src int) func() {
	const tickInterval = 60 * .3
	return func() {
		if src != w.tickSrc {
			return
		}
		if w.char.StatusIsActive(nightsoul.NightsoulBlessingStatus) {
			active := w.char.ExtendStatus(BuffKey, tickInterval)
			if !active {
				return
			}
		}
		w.core.Tasks.Add(w.extendOffField(src), tickInterval)
	}
}

func NewWeapon(c *core.Core, char *character.CharWrapper, p info.WeaponProfile) (info.Weapon, error) {
	w := &Weapon{
		core: c,
		char: char,
	}
	r := float64(p.Refine)

	m := make([]float64, attributes.EndStatType)
	scorchingBrilliance := func(args ...any) {
		if c.Player.Active() != char.Index() {
			return
		}
		if char.StatusIsActive(BuffICDKey) {
			return
		}
		char.AddStatus(BuffICDKey, BuffICDDur, true)
		w.extended = 0

		char.AddStatMod(character.StatMod{
			Base:         modifier.NewBaseWithHitlag(BuffKey, BuffDur),
			AffectedStat: attributes.NoStat,
			Amount: func() []float64 {
				m[attributes.ATKP] = 0.21 + 0.07*r
				m[attributes.CD] = 0.15 + 0.05*r
				if char.StatusIsActive(nightsoul.NightsoulBlessingStatus) {
					m[attributes.ATKP] *= 1.75
					m[attributes.CD] *= 1.75
				}
				return m
			},
		})
	}
	c.Events.Subscribe(event.OnSkill, scorchingBrilliance, fmt.Sprintf("%v-athousandblazingsuns-skill", char.Base.Key.String()))
	c.Events.Subscribe(event.OnBurst, scorchingBrilliance, fmt.Sprintf("%v-athousandblazingsuns-burst", char.Base.Key.String()))

	c.Events.Subscribe(event.OnEnemyDamage, func(args ...any) {
		if c.Player.Active() != char.Index() {
			return
		}
		atk := args[1].(*info.AttackEvent)
		if atk.Info.ActorIndex != char.Index() {
			return
		}
		if atk.Info.AttackTag != attacks.AttackTagNormal && atk.Info.AttackTag != attacks.AttackTagExtra {
			return
		}
		if atk.Info.Element == attributes.Physical || atk.Info.Element == attributes.NoElement {
			return
		}
		if w.extended >= 3 {
			return
		}
		if !char.StatModIsActive(BuffKey) {
			return
		}
		if char.StatusIsActive(ExtendICDKey) {
			return
		}

		w.extended++
		char.AddStatus(ExtendICDKey, ExtendICDDur, true)
		char.ExtendStatus(BuffKey, ExtendDur)
	}, fmt.Sprintf("%v-athousandblazingsuns-damage", char.Base.Key.String()))

	c.Events.Subscribe(event.OnCharacterSwap, func(args ...any) {
		prev, next := args[0].(int), args[1].(int)
		if prev == char.Index() && char.StatModIsActive(BuffKey) {
			// swapping out
			w.tickSrc = c.F
			w.extendOffField(w.tickSrc)()
		} else if next == char.Index() {
			// swapping in
			w.tickSrc = -1
		}
	}, fmt.Sprintf("thousand-blazing-suns-%v-swap", char.Base.Key.String()))

	return w, nil
}
