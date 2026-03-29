package aether

import (
	"lazyimpact/gcsim/internal/characters/traveler/common/anemo"
	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/hacks"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
)

type char struct {
	*anemo.Traveler
}

func NewChar(s *core.Core, w *character.CharWrapper, p info.CharacterProfile) error {
	t, err := anemo.NewTraveler(s, w, p, 0)
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
	core.RegisterCharFunc(keys.AetherAnemo, NewChar)
	hacks.RegisterNOSpecialChar(keys.AetherAnemo)
}
