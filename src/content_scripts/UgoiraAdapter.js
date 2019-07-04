import Browser from '@/modules/Browser/Browser'
import UgoiraTool from '@/content_scripts/ugoira/Ugoira'

class UgoiraAdapter {
  constructor() {
    this.browser = Browser.getBrowser()
    this.illustContext
    this.ugoiraTool
  }

  inital(context) {
    let self = this;

    return new Promise((resolve, reject) => {
      self.browser.storage.local.get(null, items => {
        self.parseContext(context).then(context => {
          resolve(context);
        }).catch(() => {
          reject();
        });
      });
    });
  }

  parseContext(context) {
    let self = this;

    return new Promise((resolve, reject) => {
      self.illustContext = {
        illustId: context.illustId,
        illustTitle: context.illustTitle,
        userName: context.userName,
        userId: context.userId,
        userAcount: context.userAccount,
        urls: context.urls, // images
        r: context.xRestrict
      };

      let xhr = new XMLHttpRequest();

      xhr.open('get', self.buildMetaUrl(self.illustContext.illustId));

      xhr.onreadystatechange = () => {

        if (xhr.readyState === 4 && xhr.status === 200) {
          let response = JSON.parse(xhr.responseText);

          if (response.error) {
            reject();
            return;
          }

          self.illustContext.illustSrc = response.body.src;
          self.illustContext.illustOriginalSrc = response.body.originalSrc;
          self.illustContext.illustFrames = response.body.frames;
          self.illustContext.illustMimeType = response.body.mime_type;

          let duration = 0

          self.illustContext.illustFrames.forEach(function (frame) {
            duration += --frame.delay;
          });

          self.illustContext.illustDuration = duration;

          resolve(self.illustContext);
        }
      };

      xhr.send();
    });
  }

  buildMetaUrl(userId) {
    return '//www.pixiv.net/ajax/illust/' + userId + '/ugoira_meta';
  }

  makeTool() {
    if (this.ugoiraTool) {
      this.ugoiraTool.context = this.illustContext;
      return this.ugoiraTool;
    }

    return this.ugoiraTool = new UgoiraTool(this.illustContext);
  }
}

export default UgoiraAdapter;