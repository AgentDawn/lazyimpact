package xingqiu

import (
	tmpl "lazyimpact/gcsim/internal/template/character"
	"lazyimpact/gcsim/internal/template/minazuki"
	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
)

func init() {
	core.RegisterCharFunc(keys.Xingqiu, NewChar)
}

type char struct {
	*tmpl.Character
	numSwords     int
	nextRegen     bool
	burstCounter  int
	orbitalActive bool
	burstWatcher  *minazuki.Watcher
}

func NewChar(s *core.Core, w *character.CharWrapper, _ info.CharacterProfile) error {
	c := char{}
	c.Character = tmpl.NewWithWrapper(s, w)

	c.EnergyMax = 80
	c.BurstCon = 3
	c.SkillCon = 5
	c.NormalHitNum = normalHitNum

	w.Character = &c

	return nil
}

func (c *char) Init() error {
	c.a4()

	w, err := minazuki.New(
		minazuki.WithMandatory(keys.Xingqiu, "xingqiu burst", burstKey, burstICDKey, 60, c.summonSwordWave, c.Core),
		minazuki.WithAnimationDelayCheck(info.AnimationXingqiuN0StartDelay, c.shouldDelay),
	)
	if err != nil {
		return err
	}
	c.burstWatcher = w
	return nil
}

func (c *char) AnimationStartDelay(k info.AnimationDelayKey) int {
	if k == info.AnimationXingqiuN0StartDelay {
		return 7
	}
	return c.Character.AnimationStartDelay(k)
}

func (c *char) shouldDelay() bool {
	return c.Core.Player.ActiveChar().NormalCounter == 1
}
