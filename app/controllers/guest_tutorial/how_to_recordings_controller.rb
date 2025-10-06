class GuestTutorial::HowToRecordingsController < ApplicationController
  skip_before_action :require_login
  # 値判定用
  CHECK_LEVELS = ["easy", "normal", "hard"].freeze
  def index
    level = level_params[:level]

    # # リクエストスペック用: jsonエラー検証（通常はコメントアウト）
    # render json: {error: "値がありません"}, status: :not_found and return if level.blank?
    # render json: {error: "値が正しくありません"}, status: :not_found and return unless CHECK_LEVELS.include?(level)

    # 値が正しければ、インスタンス変数に格納
    if level.present? && CHECK_LEVELS.include?(level)
      @level = level
    else
      # パラメータに問題があればリダイレクト
      redirect_to guest_tutorial_introductions_path
    end
  end

  private
  def level_params
    params.permit(:level)
  end
end
