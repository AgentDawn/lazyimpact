package thundersoother

import (
	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/glog"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
	"lazyimpact/gcsim/pkg/modifier"
)

func init() {
	core.RegisterSetFunc(keys.Thundersoother, NewSet)
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
		c.Log.NewEvent("thundersoother 2 pc not implemented", glog.LogArtifactEvent, char.Index()).
			Write("frame", c.F)
	}
	if count >= 4 {
		m := make([]float64, attributes.EndStatType)
		m[attributes.DmgP] = 0.35
		char.AddAttackMod(character.AttackMod{
			Base: modifier.NewBase("ts-4pc", -1),
			Amount: func(atk *info.AttackEvent, t info.Target) []float64 {
				r, ok := t.(core.Reactable)
				if !ok {
					return nil
				}

				if r.AuraContains(attributes.Electro) {
					return m
				}
				return nil
			},
		})
	}

	return &s, nil
}
