package simulator

import (
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/model"
	"lazyimpact/gcsim/pkg/simulation"
)

func GenerateCharacterDetails(cfg *info.ActionList) ([]*model.Character, error) {
	cpy := cfg.Copy()

	c, err := simulation.NewCore(CryptoRandSeed(), false, cpy)
	if err != nil {
		return nil, err
	}
	// create a new simulation and run
	// TODO: nil shoudl be fine here
	sim, err := simulation.New(cpy, nil, c)
	if err != nil {
		return nil, err
	}

	return sim.CharacterDetails(), nil
}
