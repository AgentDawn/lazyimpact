package unforged

import (
	"lazyimpact/gcsim/internal/weapons/common"
	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
)

func init() {
	core.RegisterWeaponFunc(keys.TheUnforged, NewWeapon)
}

func NewWeapon(c *core.Core, char *character.CharWrapper, p info.WeaponProfile) (info.Weapon, error) {
	w := common.NewGoldenMajesty(base)
	return w.NewWeapon(c, char, p)
}
