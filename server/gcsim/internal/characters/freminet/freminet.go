package freminet

import (
	tmpl "lazyimpact/gcsim/internal/template/character"
	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/action"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
)

func init() {
	core.RegisterCharFunc(keys.Freminet, NewChar)
}

type char struct {
	*tmpl.Character
	skillStacks int
	c4Stacks    int
	c6Stacks    int
}

func NewChar(s *core.Core, w *character.CharWrapper, _ info.CharacterProfile) error {
	c := char{}
	c.Character = tmpl.NewWithWrapper(s, w)

	c.EnergyMax = 60
	c.NormalHitNum = normalHitNum
	c.NormalCon = 3
	c.SkillCon = 5
	c.HasArkhe = true

	w.Character = &c

	return nil
}

func (c *char) Init() error {
	c.onExitField()

	c.a4()

	c.c1()
	c.c4c6()

	return nil
}

func (c *char) ActionReady(a action.Action, p map[string]int) (bool, action.Failure) {
	if a == action.ActionSkill && c.StatusIsActive(persTimeKey) {
		return true, action.NoFailure
	}
	return c.Character.ActionReady(a, p)
}
