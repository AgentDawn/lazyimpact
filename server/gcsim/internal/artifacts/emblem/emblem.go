package emblem

import (
	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/attacks"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
	"lazyimpact/gcsim/pkg/modifier"
)

func init() {
	core.RegisterSetFunc(keys.EmblemOfSeveredFate, NewSet)
}

type Set struct {
	Index int
	Count int
}

func (s *Set) SetIndex(idx int) { s.Index = idx }
func (s *Set) GetCount() int    { return s.Count }
func (s *Set) Init() error      { return nil }

func NewSet(c *core.Core, char *character.CharWrapper, count int, param map[string]int) (info.Set, error) {
	s := Set{Count: count}

	if count >= 2 {
		m := make([]float64, attributes.EndStatType)
		m[attributes.ER] = 0.20
		char.AddStatMod(character.StatMod{
			Base:         modifier.NewBase("emblem-2pc", -1),
			AffectedStat: attributes.ER,
			Amount: func() []float64 {
				return m
			},
		})
	}
	if count >= 4 {
		m := make([]float64, attributes.EndStatType)
		er := char.NonExtraStat(attributes.ER)
		amt := 0.25 * er
		if amt > 0.75 {
			amt = 0.75
		}
		m[attributes.DmgP] = amt

		char.AddAttackMod(character.AttackMod{
			Base: modifier.NewBase("emblem-4pc", -1),
			Amount: func(atk *info.AttackEvent, t info.Target) []float64 {
				if atk.Info.AttackTag != attacks.AttackTagElementalBurst {
					return nil
				}
				// calc er
				er := char.NonExtraStat(attributes.ER)
				amt := 0.25 * er
				if amt > 0.75 {
					amt = 0.75
				}
				m[attributes.DmgP] = amt
				return m
			},
		})
	}

	return &s, nil
}
