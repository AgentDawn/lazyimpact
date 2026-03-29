package defenderswill

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
	core.RegisterSetFunc(keys.DefendersWill, NewSet)
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

	// 2 Piece: DEF +30%
	if count >= 2 {
		m := make([]float64, attributes.EndStatType)
		m[attributes.DEFP] = 0.30
		char.AddStatMod(character.StatMod{
			Base:         modifier.NewBase("defenderswill-2pc", -1),
			AffectedStat: attributes.DEFP,
			Amount: func() []float64 {
				return m
			},
		})
	}
	// TODO: player dmg isn't correct so no point in implementing this for now
	// 4 Piece: For each different element present in your own party, the wearer's Elemental RES to that corresponding element is increased by 30%.
	if count >= 4 {
		c.Log.NewEvent("defenderswill-4pc not implemented", glog.LogArtifactEvent, char.Index())
	}

	return &s, nil
}
