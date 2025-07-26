export class Bounty {
  constructor({
    Title = "",
    Item = [""],
    Source = "",
    Description = "",
    Type = "",
    Bounty = 0,
    Wiki_URL = "https://oldschool.runescape.wiki/w/Cabbage",
    Status = "",
    Other = "",
    RSN="",
    Discord="",
    S3_URL = "",
    Quantity = 0,
    Sheet_Index,
    Wiki_Image = "https://oldschool.runescape.wiki/images/Cabbage_detail.png",
    Tier_completed = false,
  } = {}) {
    this.Title = Title;
    this.Item = Item;
    this.Source = Source;
    this.Description = Description;
    this.Type = Type;
    this.Bounty = Bounty;
    this.Wiki_URL = Wiki_URL;
    this.Status = Status;
    this.Other = Other;
    this.RSN = RSN;
    this.Discord = Discord;
    this.S3_URL = S3_URL;
    this.Quantity = Quantity;
    this.Sheet_Index = Sheet_Index;
    this.Wiki_Image = Wiki_Image;
    this.Tier_completed = Tier_completed;
    this.Completed = false;
  }
}
