package lumine

import (
	"lazyimpact/gcsim/internal/characters/traveler/common/hydro"
	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
)

type char struct {
	*hydro.Traveler
}

func NewChar(s *core.Core, w *character.CharWrapper, p info.CharacterProfile) error {
	t, err := hydro.NewTraveler(s, w, p, 1)
	if err != nil {
		return err
	}
	c := &char{
		Traveler: t,
	}
	w.Character = c

	return nil
}

func init() {
	core.RegisterCharFunc(keys.LumineHydro, NewChar)
}
